# Memory-Map DSL

The Memory-Map DSL is a JSON language for radio EEPROM *layout*: which bytes become which settings. A generic codec in `@springfield/ham-radio-utils` decode/encodes it. Radio modules ship a map next to the [Protocol DSL](./dsl) so a new radio can expose settings **without a TypeScript decoder**.

## Mental model

| Layer | Responsibility |
| --- | --- |
| Protocol DSL | Serial handshake + chunked read/write of named segments |
| Memory-Map DSL | Bytes in the image → nested settings object (and back) |
| Channel codec (optional) | Per-channel records until those are also expressed in the map |

Addresses in the map are **radio EEPROM addresses**, not Chirp image offsets.

## Chirp image vs radio address

Chirp UV-5R images prefix **8 ident bytes**. Chirp `MEM_FORMAT` `#seekto` values are image offsets.

```
radioAddress = chirpImageOffset - 8
```

Examples:

| Struct | Chirp image | Radio address |
| --- | --- | --- |
| Channel names | `0x1008` | `0x1000` |
| User settings | `0x0E28` | `0x0E20` |
| Power-on message | `0x1828` | `0x1EE0` (in aux segment) |

Do not copy Chirp source (GPL-2). Re-express the layout and menu enumerations as JSON.

## Packed vs sparse buffers

The driver **packs** segments (channels then settings) into a contiguous buffer. The engine maps radio address → buffer offset using `memoryConfig.segments` order.

- Main-block addresses (`0x0E20`) stay at the same offset in a packed buffer.
- Aux addresses (`0x1EC0+`) land in the packed tail: `6144 + (addr - 7872)` for UV-5R.

A sparse buffer whose length covers the highest segment end address (`8192` for UV-5R) uses absolute radio addresses as offsets. Encode **patches in place**; it must not wipe unread bytes with `0xFF`.

## Root shape

```json
{
  "version": "1.0.0",
  "description": "Baofeng UV-5R settings",
  "structs": [
    {
      "id": "settings",
      "seek": "0x0E20",
      "fields": []
    }
  ]
}
```

Optional: `count` + `stride` on a struct for repeated records (PTT-ID codes).

## Fields

Sequential layout from `seek`. Bitfields pack **MSB-first** within a byte (Chirp bitwise style).

| `type` | Meaning |
| --- | --- |
| `u8` | One byte (or multi-byte via `value.length` for ascii/digits/dtmf/bbcd) |
| `u16` | Little-endian 16-bit (Chirp `ul16`) |
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

### UI metadata

Non-reserved fields should include `ui` for schema-driven forms:

```json
{
  "id": "squelch",
  "type": "u8",
  "value": { "kind": "integer", "min": 0, "max": 9 },
  "ui": {
    "group": "basic",
    "label": "Carrier Squelch Level",
    "widget": "integer",
    "description": "…",
    "writable": true
  }
}
```

Widgets: `integer`, `select`, `switch`, `text`, `number`. Set `writable: false` for firmware / read-only messages.

## Example (excerpt)

```json
{
  "id": "settings",
  "seek": "0x0E20",
  "fields": [
    {
      "id": "squelch",
      "type": "u8",
      "value": { "kind": "integer", "min": 0, "max": 9 },
      "ui": { "group": "basic", "label": "Carrier Squelch Level", "widget": "integer" }
    },
    { "id": "_unknown1", "type": "u8", "reserved": true },
    {
      "id": "save",
      "type": "u8",
      "value": { "kind": "enum", "values": ["Off", "1:1", "1:2", "1:3", "1:4"] },
      "ui": { "group": "basic", "label": "Battery Saver", "widget": "select" }
    }
  ]
}
```

Decoded object:

```json
{
  "settings": {
    "squelch": 3,
    "save": "1:2"
  }
}
```

## Adding a radio without codec code

1. Write Protocol DSL `readMemory` / `writeMemory` and `memoryConfig.segments`.
2. Author `memory-maps/<model>-settings.json` with radio addresses and UI groups.
3. Reference it from the radio config (`memoryMap.$ref`) and/or ship it with a thin codec that calls `decodeMemoryMap` / `encodeMemoryMap`.
4. Validate with `SchemaValidator.validateMemoryMap` (`radio-memory-map-schema.json` in `@springfield/ham-radio-utils`).

Channel tables can move onto the same map later (`memory[128]`-style structs). Until then, a small channel codec may remain.

## UV-5R reference map

Shipped as [`uv5r-settings.json`](https://gitlab.com/springfield-ham-radio/drivers/radio-module-baofeng/-/blob/main/src/shared/memory-maps/uv5r-settings.json) in `@springfield/radio-module-baofeng`. Groups: basic, advanced, workmode, dtmf, other, service.

## API

- Types: `@springfield/ham-radio-api` — `RadioMemoryMap`, nested `RadioSettings`
- Engine: `decodeMemoryMap`, `encodeMemoryMap`, `radioAddressToBufferOffset`
- UI helpers: `collectMemoryMapUiFields`, `groupMemoryMapUiFields`
