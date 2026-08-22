# Protocols & DSL Overview

The Springfield Ham Radio ecosystem uses a JSON protocol language to describe clone-style serial I/O. A single driver interprets the steps, so new radios are added with configuration rather than a new driver class.

## Why a Protocol DSL?

- **Radio independence**: One interpreter supports many radios.
- **Declarative**: Handshake and memory transfer are data, not TypeScript.
- **Testable**: Protocol JSON can be validated against a schema.

## Core ideas

- **Exchange**: `send` bytes and `expect` a reply (exact ACK, N opaque bytes, or a framed pattern).
- **Chunk loop**: `read` / `write` repeats an exchange across named memory segments.
- **Placeholders**: `$address`, `$chunkSize`, `$length`, `$data` are filled in at runtime.
- **Hex tokens**: `"0x50"` and `"S"` are valid JSON stand-ins for hex and ASCII opcodes.

## Step types

- **Exchange**: top-level `send` and/or `expect`
- **Read**: `{ "read": { "segments", "send", "expect", "ack?" } }`
- **Write**: `{ "write": { "segments", "send", "expect" } }`

See the [Protocol DSL](./dsl) reference for the full language, placeholders, and a Baofeng UV-5R example.

## Next steps

- Learn the [Protocol DSL](./dsl) in detail
- See how protocols load through the [Registry Architecture](/reference/registry/architecture)
- Explore the [Development Guide](/development-guide) for implementation details
