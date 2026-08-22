# Protocol DSL

The Protocol DSL is a JSON language for clone-style radio I/O: send bytes on a serial port and wait for a reply. A generic driver interprets the steps. Radio modules ship the protocol in their config instead of writing per-radio driver code.

## Mental model

Two kinds of steps:

1. **Exchange** — send bytes, wait for a reply (handshake, ACK).
2. **Chunk loop** — repeat an exchange across a memory segment (download or upload).

`endAddress` in `memoryConfig.segments` is **inclusive**. A range `0–6143` is 6144 bytes.

## Root fields

Protocol steps live on the radio config next to serial and memory settings:

```json
{
  "id": {
    "model": "baofeng-uv5r",
    "name": "Baofeng UV-5R",
    "manufacturer": "Baofeng"
  },
  "version": "1.0.0",
  "description": "Baofeng UV-5R radio configuration",
  "serialConfig": {
    "baudRate": 9600,
    "dataBits": 8,
    "stopBits": 1,
    "parity": "none"
  },
  "memoryConfig": {
    "chunkSize": 64,
    "addressSize": 2,
    "addressEndianness": "big",
    "segments": {
      "channels": { "startAddress": 0, "endAddress": 6143 },
      "settings": { "startAddress": 7872, "endAddress": 8191 }
    }
  },
  "readMemory": [],
  "writeMemory": []
}
```

`addressSize` and `addressEndianness` control how `$address` is encoded on the wire.

## Exchange

An exchange has optional `send`, optional `expect`, and optional `description` / `timeout` (milliseconds, default 5000). At least one of `send` or `expect` is required.

```json
{
  "description": "Send magic number",
  "send": ["0x50", "0xBB", "0xFF", "0x20", "0x12", "0x07", "0x25"],
  "expect": "0x06"
}
```

Omit `expect` to send without waiting. Omit `send` to wait for inbound data first.

### Byte tokens

In `send` and `expect` arrays:

| Token | Meaning |
| --- | --- |
| `6` | Literal byte 0–255 |
| `"0x50"` | Hex literal |
| `"S"` | Single-character ASCII opcode |
| `"$address"` | Current chunk address (`addressSize` + `addressEndianness`) |
| `"$chunkSize"` | `memoryConfig.chunkSize` as one byte |
| `"$length"` | Current chunk length as one byte |
| `"$data"` | Chunk payload (see read/write) |

JSON cannot use `0x50` as a number. Prefer `"0x50"` or `"S"` over decimal `80` / `83`.

### Expect

`expect` is overloaded by shape — there is no `type` field.

| Author writes | Meaning |
| --- | --- |
| `6` or `"0x06"` | Exact 1-byte match (ACK) |
| `[6, 0]` or `["0x06", "0x00"]` | Exact multi-byte match |
| `{ "bytes": 8 }` | Any 8 bytes (radio ID, opaque blob) |
| `["X", "$address", "$length", "$data"]` | Framed reply: literals must match; `$…` are slots |

`$length` in `expect` is a 1-byte length prefix used to size `$data`. If `$length` is omitted, `$data` uses the current chunk size.

## Chunked read

`read` repeats the exchange for every chunk in the named segments. `$data` in `expect` is stored in the memory buffer. Optional `ack` is a second exchange after each chunk.

```json
{
  "description": "Read memory",
  "read": {
    "segments": ["channels", "settings"],
    "send": ["S", "$address", "$chunkSize"],
    "expect": ["X", "$address", "$length", "$data"],
    "ack": {
      "send": ["0x06"],
      "expect": "0x06"
    }
  }
}
```

## Chunked write

`write` repeats the exchange for every chunk. `$data` in `send` emits the current chunk from the memory buffer.

```json
{
  "description": "Write memory",
  "write": {
    "segments": ["channels", "settings"],
    "send": ["X", "$address", "$chunkSize", "$data"],
    "expect": "0x06"
  }
}
```

## Baofeng UV-5R

### Read

```json
{
  "readMemory": [
    {
      "description": "Send magic number",
      "send": ["0x50", "0xBB", "0xFF", "0x20", "0x12", "0x07", "0x25"],
      "expect": "0x06"
    },
    {
      "description": "Get radio identifier",
      "send": ["0x02"],
      "expect": { "bytes": 8 }
    },
    {
      "description": "Begin clone operation",
      "send": ["0x06"],
      "expect": "0x06"
    },
    {
      "description": "Read memory",
      "read": {
        "segments": ["channels", "settings"],
        "send": ["S", "$address", "$chunkSize"],
        "expect": ["X", "$address", "$length", "$data"],
        "ack": {
          "send": ["0x06"],
          "expect": "0x06"
        }
      }
    }
  ]
}
```

### Write

```json
{
  "writeMemory": [
    {
      "description": "Send magic number",
      "send": ["0x50", "0xBB", "0xFF", "0x20", "0x12", "0x07", "0x25"],
      "expect": "0x06"
    },
    {
      "description": "Write memory",
      "write": {
        "segments": ["channels", "settings"],
        "send": ["X", "$address", "$chunkSize", "$data"],
        "expect": "0x06"
      }
    }
  ]
}
```

Handshake is three exchanges. Memory transfer is one `read` or `write` over both segments.

## Execution

The driver walks `readMemory` or `writeMemory` in order:

1. Resolve `$` placeholders and hex/ASCII tokens.
2. Write `send` bytes to the serial port.
3. Wait for `expect` (byte-length parser + timeout).
4. For `read` / `write`, repeat per chunk and update progress within that step.

JSON Schema for the language lives in `@springfield/ham-radio-utils` (`radio-protocol-schema.json`). Types live in `@springfield/ham-radio-api` (`RadioProtocolStep`).
