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

An exchange has optional `send`, optional `expect`, optional `setBaudRate`, and optional `description` / `timeout` (milliseconds, default 5000). At least one of `send`, `expect`, or `setBaudRate` is required.

```json
{
  "description": "Send magic number",
  "send": ["0x50", "0xBB", "0xFF", "0x20", "0x12", "0x07", "0x25"],
  "expect": "0x06"
}
```

Kenwood TH-D74 clone mode enters programming at 9600 baud then transfers at 57600:

```json
{
  "description": "Switch to clone baud",
  "setBaudRate": 57600,
  "expect": { "bytes": 1 }
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
| `"$address"` | Current chunk **byte** address (`addressSize` + `addressEndianness`) |
| `"$block"` | Current chunk **index** (`floor(byteAddress / chunkSize)`), same width/endianness as `$address`. Kenwood TH-D74 clone headers use this. |
| `"$chunkSize"` | Current chunk size as one byte (`write.chunkSize` or `memoryConfig.chunkSize`) |
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

Optional fields:

| Field | Meaning |
| --- | --- |
| `chunkSize` | Override `memoryConfig.chunkSize` for this write |
| `delay` | Milliseconds to wait after each accepted block |
| `skip` | Inclusive radio-address ranges that must not be uploaded |

`$length` is the current payload size. Use it on write when the block size may differ from the read chunk size.

```json
{
  "description": "Write memory",
  "write": {
    "segments": ["channels", "settings"],
    "chunkSize": 16,
    "delay": 50,
    "skip": [
      { "startAddress": 3312, "endAddress": 3327 },
      { "startAddress": 3568, "endAddress": 3583 }
    ],
    "send": ["X", "$address", "$length", "$data"],
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

Chirp's UV-5R upload (`_ident_radio` then `_send_block`) is the same handshake as read, then 16-byte `X` blocks. Two 16-byte calibration holes in the main block are not written (`0x0CF0–0x0CFF` and `0x0DF0–0x0DFF`). Each block waits 50ms after the radio ACKs.

```json
{
  "writeMemory": [
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
      "description": "Write memory",
      "write": {
        "segments": ["channels", "settings"],
        "chunkSize": 16,
        "delay": 50,
        "skip": [
          { "startAddress": 3312, "endAddress": 3327 },
          { "startAddress": 3568, "endAddress": 3583 }
        ],
        "send": ["X", "$address", "$length", "$data"],
        "expect": "0x06"
      }
    }
  ]
}
```

Handshake is three exchanges. Memory transfer is one `read` (64-byte `S` blocks) or `write` (16-byte `X` blocks) over both segments.

## Kenwood TH-D74 (clone mode)

The TH-D74 is a 256-byte block clone, not a Baofeng-style `S`/`X` dump:

1. ASCII `0M PROGRAM\r` at 9600 baud; radio replies `0M\r`.
2. Switch to 57600 baud and discard one sync byte.
3. Read: send `R` + `$block` + `0x0000`, expect `W` + `$block` + `0x0000` + 256 data bytes, then ACK `0x06`/`0x06`.
4. Write: send `W` + `$block` + `0x0000` + 256 data bytes, expect `0x06`. Skip the last two blocks.
5. Send `E` to leave programming mode.

Enable `serialConfig.rtscts` (hardware flow control). macOS USB CDC needs it.

`$block` is the chunk index (`0, 1, 2, …`), not the byte address. A 2-byte big-endian `$address` at byte 256 would be `0x0100` (block 256) instead of `0x0001` (block 1).

## Execution

The driver walks `readMemory` or `writeMemory` in order:

1. Resolve `$` placeholders and hex/ASCII tokens.
2. Write `send` bytes to the serial port.
3. Wait for `expect` (byte-length parser + timeout).
4. For `read` / `write`, repeat per chunk and update progress within that step.

JSON Schema for the language lives in `@springfield/ham-radio-utils` (`radio-protocol-schema.json`). Types live in `@springfield/ham-radio-api` (`RadioProtocolStep`).
