# Protocols & DSL Overview

The HamBench ecosystem uses JSON languages to describe clone-style serial I/O and EEPROM layout. A generic driver and codec interpret the data, so new radios are added with configuration rather than new TypeScript classes.

## Two DSLs

| DSL | Purpose |
| --- | --- |
| [Protocol DSL](./dsl) | Serial handshake and chunked memory transfer |
| [Memory-Map DSL](./memory-map) | EEPROM bytes ↔ radio settings (and UI metadata) |

## Why declarative radio support?

- **Radio independence**: One interpreter supports many radios.
- **Declarative**: Handshake, layout, and menus are data, not TypeScript.
- **Testable**: Protocol and memory-map JSON validate against schemas.

## Protocol DSL (I/O)

- **Exchange**: `send` bytes and `expect` a reply (exact ACK, N opaque bytes, or a framed pattern).
- **Chunk loop**: `read` / `write` repeats an exchange across named memory segments.
- **Placeholders**: `$address`, `$chunkSize`, `$length`, `$data` are filled in at runtime.
- **Write extras**: optional `chunkSize`, `delay`, and `skip` on a `write` step (UV-5R clone uses 16-byte blocks).

## Memory-Map DSL (settings)

- **Structs** at radio EEPROM `seek` addresses with sequential fields.
- **Encodings**: integers, enums, booleans, ASCII, digit arrays, DTMF, BCD, bitfields.
- **UI metadata**: group, label, widget — enough for a schema-driven Settings tab.

See the [Memory-Map DSL](./memory-map) for UV-5R address conversion (Chirp image − 8) and the “no code” path for a new radio.

## Next steps

- Learn the [Protocol DSL](./dsl) in detail
- Learn the [Memory-Map DSL](./memory-map) in detail
- See how protocols load through the [Registry Architecture](/developer/registry/architecture)
- Explore the [Development Guide](/developer/development-guide) for implementation details
