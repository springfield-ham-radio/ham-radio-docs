# ADR 0003: Memory-Map DSL

- **Status:** Accepted
- **Date:** 2026-10-10

## Context

After the Protocol DSL reads or writes named memory segments, HamBench must interpret the byte image as channels and radio-wide settings. Radio modules ship a JSON memory map next to the protocol config. A generic codec in [ham-radio-utils](https://github.com/springfield-ham-radio/ham-radio-utils) ([`memory-map-codec.ts`](https://github.com/springfield-ham-radio/ham-radio-utils/blob/main/src/memory/memory-map-codec.ts), [`radio-memory-map-schema.json`](https://github.com/springfield-ham-radio/ham-radio-utils/blob/main/src/schemas/radio-memory-map-schema.json)) decodes and encodes that layout so new radios do not need a hand-written TypeScript decoder.

CHIRP and other tools use different on-disk image layouts for some models. HamBench maps use **radio EEPROM addresses**. UV-5R documents the Chirp offset relationship in the shipped map and in [Memory-Map DSL](/developer/protocols/memory-map).

## Decision

**Memory-Map DSL.** Layout is JSON: `structs`, optional `groups` for Settings UI, `channelBindings` to portable [`RadioChannel`](https://github.com/springfield-ham-radio/ham-radio-api), and field `ui` metadata (`group`, `subgroup`, `menu`, `order`, widgets).

**Addresses and buffers.** Addresses in the map are radio-native, not Chirp image offsets. The driver may pack segments into a contiguous buffer or keep a sparse image; encode **patches in place** without wiping unread bytes or changing image size. See [Memory-Map DSL](/developer/protocols/memory-map) for packed vs sparse rules.

**Binary layout.** Multi-byte integers (`u16`, `u32`) are little-endian in the codec. Bitfields pack MSB-first within a byte. Repeated channel structs may use `count`, `stride`, `groupSize`, `groupPad`, `emptyWhen`, and `clearEmpty`.

**Value kinds.** The schema defines kinds including `integer`, `boolean`, `enum`, `ascii`, `digits`, `dtmf`, `bbcd`, `lbcd`, `tone`, `ctcss-index`, and `dcs-index` on field types `u8` / `u16` / `u32` / `bits` / `char`. The living schema is authoritative; the developer guide lists them for readers.

**Portable channel vs EEPROM.** `channelBindings` project decode output onto `RadioChannel` (frequencies in Hz, tones). Duplex, repeater offset, and tone *mode* on that portable model are derived in the UI when needed—they are not required EEPROM fields. Individual radios may still store offset or shift in VFO or settings structs (for example UV-5R VFO fields in [`uv5r-settings.json`](https://github.com/springfield-ham-radio/radio-module-baofeng/blob/main/src/shared/memory-maps/uv5r-settings.json)).

**Adding a radio.** Author protocol segments, a memory map, and `codec.type: "memoryMap"` in the config. Validate with `SchemaValidator.validateMemoryMap`. No per-radio codec TypeScript in the module ([ADR 0004](./0004-radio-modules-json-only.md)).

## Options considered

**TypeScript decoder per radio.** Rejected for official modules. It duplicates the generic codec and blocks JSON-only distribution.

**Use Chirp image offsets as map addresses.** Rejected. Maps target radio EEPROM; conversion notes (for example UV-5R +8 ident prefix) belong in map metadata and docs, not as the primary addressing scheme.

**JSON map + `createMemoryMapCodec()`.** Accepted.

## Consequences

- Memory-map changes are reviewed against the schema and round-trip tests in module repos.
- UI Settings and Channels columns are driven from map `ui` and `channelBindings` without per-radio forms in ham-radio-ui.
- CHIRP source remains reference-only for layout understanding ([ADR 0007](./0007-mit-license-no-chirp-code.md)).
- Incorrect Chirp-to-radio conversion in prose tables is fixed in the protocol docs when found; this ADR does not duplicate every address example.
