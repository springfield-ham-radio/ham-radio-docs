# Memory-Map DSL

The Memory-Map DSL is a JSON language for radio EEPROM *layout*: which bytes become which settings and channels. A generic codec in `@springfield/ham-radio-utils` decode/encodes it. Radio modules ship a map next to the [Protocol DSL](./dsl) so a new radio can expose settings and channels **without a TypeScript decoder**.

## Mental model

| Layer | Responsibility |
| --- | --- |
| Protocol DSL | Serial handshake + chunked read/write of named segments |
| Memory-Map DSL | Bytes in the image → nested bag (and back) |
| Channel bindings | Project channel structs into portable `RadioChannel` + slot `settings` |

Addresses in the map are **radio EEPROM addresses**, not Chirp image offsets.

## Chirp image vs radio address

Chirp UV-5R images prefix **8 ident bytes**. Chirp `MEM_FORMAT` `#seekto` values are image offsets.

```
radioAddress = chirpImageOffset - 8
```

Examples:

| Struct | Chirp image | Radio address |
| --- | --- | --- |
| Channel records | `0x0008` | `0x0000` |
| Channel names | `0x1008` | `0x1000` |
| User settings | `0x0E28` | `0x0E20` |
| Power-on message | `0x1828` | `0x1EE0` (in aux segment) |

Do not copy Chirp source (GPL-2). Re-express the layout and menu enumerations as JSON.

## Packed vs sparse buffers

The driver **packs** segments (channels then settings) into a contiguous buffer. The engine maps radio address → buffer offset using `memoryConfig.segments` order.

- Main-block addresses (`0x0E20`) stay at the same offset in a packed buffer.
- Aux addresses (`0x1EC0+`) land in the packed tail: `6144 + (addr - 7872)` for UV-5R.

A sparse buffer whose length covers the highest segment end address (`8192` for UV-5R) uses absolute radio addresses as offsets. Encode **patches in place**; it must not wipe unread bytes with `0xFF`, and it must not grow or shrink the image. A packed driver read stays packed; a sparse image stays sparse. Padding a packed clone out to the sparse size misaligns segments that skip a hole (Kenwood TM-D710A block `0x7F`).

## Root shape

```json
{
  "version": "1.0.0",
  "description": "Baofeng UV-5R channels + settings",
  "groups": [
    {
      "id": "basic",
      "label": "Basic",
      "icon": "i-lucide-sliders-horizontal",
      "groups": [
        { "id": "receive", "label": "Receive" },
        { "id": "display", "label": "Display" }
      ]
    }
  ],
  "channelBindings": {
    "records": "channels",
    "names": "names",
    "nameField": "name",
    "receiveFrequency": "rxfreq",
    "transmitFrequency": "txfreq",
    "receiveTone": "rxtone",
    "transmitTone": "txtone"
  },
  "structs": []
}
```

Optional on a struct: `count` + `stride` for repeated records; `groupSize` + `groupPad` when records are packed into clone blocks with padding (Kenwood TH-D74: 6 × 40-byte memories + 16 pad = 256); `emptyWhen` / `clearEmpty` for channel occupancy. Kenwood TM-D710A memories are a flat 16-byte stride at `0x1700` (no group padding).

## Fields

Sequential layout from `seek`. Bitfields pack **MSB-first** within a byte (Chirp bitwise style).

| `type` | Meaning |
| --- | --- |
| `u8` | One byte (or multi-byte via `value.length` for ascii/digits/dtmf/bbcd/lbcd) |
| `u16` | Little-endian 16-bit (Chirp `ul16`); also used with `tone` |
| `u32` | Little-endian 32-bit (Chirp `ul32`; Kenwood TH-D74 frequencies in Hz) |
| `bits` | Bitfield; requires `width` (1–8) |

Set `"reserved": true` for padding. Reserved fields advance the cursor but are omitted from decode output.

### Value kinds

| `value.kind` | Result |
| --- | --- |
| `integer` | Number (`min` / `max` for UI) |
| `boolean` | `0` / nonzero → boolean |
| `enum` | Index into `values[]` |
| `ascii` | `length` bytes, stop at `0x00`/`0xFF` |
| `digits` | Decimal digit bytes → number × `scale` (VFO freq uses `scale: 10`) |
| `dtmf` | Index into `charset` (default `0123456789 *#ABCD`), `0xFF` terminates |
| `bbcd` | Packed BCD → integer (band limits) |
| `lbcd` | Chirp little-endian “hex digits are decimal” → Hz (`scale`, default 10) |
| `tone` | UV-5R tone word: none / CTCSS (`>= ctcssMin`) / DCS index into `values` (+ `reverseOffset` for R) |
| `ctcss-index` | CTCSS stored as an index into `values` (Hz × 10). Kenwood TH-D74 `rtone` / `ctone`. |
| `dcs-index` | DCS stored as an index into `values`. Kenwood TH-D74 `dtcs_code`. |

### Occupancy

For repeated structs (channels):

```json
{
  "emptyWhen": { "equals": 255 },
  "clearEmpty": true
}
```

- Decode: if the first byte of the instance equals `equals`, the slot is `null`.
- Encode: missing/`null` instances are filled with `0xFF` for `stride` bytes when `clearEmpty` is true (Chirp-like clear).

### UI metadata

Non-reserved fields should include `ui` for schema-driven forms and tables.

- **Radio-wide settings:** `collectMemoryMapUiFields` (skips channel-bound structs).
- **Settings groups:** declare a top-level `groups` array. Each group has `id` and `label`, and may include `description`, `icon` (Iconify name), and `warning` (`title` + `description`). Field `ui.group` must match a group `id`. Declaration order is the left-nav order on the Settings tab.
- **Settings sub-groups:** a group may include nested `groups`. Those become headed sections in the settings panel. Set field `ui.subgroup` to the nested group `id`. Fields without `subgroup` stay at the top of the panel. `collectMemoryMapUiGroups` applies this metadata and omits empty groups and empty sub-groups. Fields whose `ui.group` is not declared still appear after the declared groups.
- **Descriptions:** field, group, and sub-group `description` values appear as a help-icon tooltip after the label.
- **Display order:** struct field order is the EEPROM layout. Set `ui.order` (lower first) to change Settings-tab order without moving bytes. Fields without `order` keep declaration order.
- **Per-channel extras:** put `ui` on fields of the `channelBindings.records` struct; `collectChannelMemoryMapUiFields` returns them for Channels-table columns. Bound RadioChannel fields (`rxfreq`, tones, …) are omitted. Use `formatMemoryMapFieldValue` for read-only cell text.

Widgets: `integer`, `select`, `switch`, `text`, `number`. Set `writable: false` for firmware / read-only messages.

```json
{
  "id": "squelch",
  "type": "u8",
  "value": { "kind": "integer", "min": 0, "max": 9 },
  "ui": {
    "group": "basic",
    "subgroup": "receive",
    "label": "Carrier Squelch Level",
    "widget": "integer",
    "description": "How strong a received signal must be before the speaker unmutes."
  }
}
```

## Channel bindings and reusable RadioChannel

`channelBindings` maps decoded record fields onto the portable [`RadioChannel`](https://github.com/springfield-ham-radio/ham-radio-api) core:

| Portable (`RadioChannel`) | Map field roles |
| --- | --- |
| `name` | `names` struct + `nameField` |
| `receiveFrequency` / `transmitFrequency` | Hz from `lbcd` |
| `receiveTone` / `transmitTone` | From `tone` |

Everything else on the channel record (power, wide/NFM, scan skip, PTT-ID, BCL, …) lands in `RadioProgrammedChannel.settings`.

Duplex, offset, and Chirp `tmode` are **derived** from RX/TX + tones in the UI if needed—they are not EEPROM fields. Store absolute frequencies and concrete tones so a future channel library can reuse `RadioChannel` across radios.

Helpers:

- `decodeRadioProgram` / `encodeRadioProgram` — full program round-trip
- `bindingsToChannels` / `programToChannelSettings` — bag ↔ channels

## Adding a radio without codec code

1. Write Protocol DSL `readMemory` / `writeMemory` and `memoryConfig.segments`. UV-5R write uses 16-byte blocks, a 50ms pause, and two skipped calibration holes — see the [Protocol DSL](./dsl).
2. Author `memory-maps/<model>-settings.json` with radio addresses, channel structs, bindings, and UI groups.
3. Reference it from the radio config (`memoryMap.$ref`) and call `decodeRadioProgram` / `encodeRadioProgram` from a thin codec.
4. Validate with `SchemaValidator.validateMemoryMap` (`radio-memory-map-schema.json` in `@springfield/ham-radio-utils`).

## UV-5R reference map

Shipped as [`uv5r-settings.json`](https://github.com/springfield-ham-radio/radio-module-baofeng/blob/main/src/shared/memory-maps/uv5r-settings.json) in `@springfield/radio-module-baofeng`.

Includes:

- `channels` / `names` (128 × 16) with full Chirp channel bitfields
- Radio-wide groups: basic, advanced, workmode, other, dtmf, service (declared in `groups`, with panel sub-groups and a calibration warning on service)

## API

- Types: `@springfield/ham-radio-api` — `RadioMemoryMap`, `RadioMemoryMapGroup`, `RadioMemoryMapSubgroup`, `channelBindings`, nested `RadioSettings`
- Engine: `decodeMemoryMap`, `encodeMemoryMap`, `decodeRadioProgram`, `encodeRadioProgram`, `radioAddressToBufferOffset`
- UI helpers: `collectMemoryMapUiFields`, `collectMemoryMapUiGroups`, `groupMemoryMapUiFields` (skips channel-bound structs)
