# Radio config reference

A radio module config is one `configs/<model>.json` file. [Build a radio driver](/developer/build-a-radio-driver) walks through the Baofeng UV-5R file. This page lists the fields.

Two checks apply, and they are not the same list:

- `SchemaValidator.validateRadioProtocol` in `@springfield/ham-radio-utils` compiles `src/schemas/radio-protocol-schema.json`. The root object does **not** set `additionalProperties: false`, so fields that the schema does not name are still accepted. After the schema check, the validator requires `serialConfig.baudRate` to be a member of `serialConfig.baudRates` when that array is present.
- `validateConfiguration` in `@springfield/ham-radio-registry` requires `id.model`, `serialConfig`, `memoryConfig`, a non-empty `readMemory`, a non-empty `writeMemory`, and `settingsSchema`. It also checks `readMessage` and `writeMessage` when they are present. It does not reject unknown fields, and it does not require `minApiVersion`.

`yarn pack:release` in the manufacturer repo requires `minApiVersion`, `id.model`, `id.name`, and `version`, and it requires the file name to be `configs/<id.model>.json`.

Step behavior is [Protocol DSL](/developer/protocols/dsl). Memory-map behavior is [Memory-map DSL](/developer/protocols/memory-map). The tables below are the field lists from the schemas those pages describe.

## Protocol schema fields

<!-- generated:protocol -->

Generated from `src/schemas/radio-protocol-schema.json` in [`springfield-ham-radio/ham-radio-utils`](https://github.com/springfield-ham-radio/ham-radio-utils) at `9477e28b27a671db52869db8f3dde3c867b7c896`.

Radio Protocol DSL Schema. Schema for defining radio communication protocols as send/expect exchanges

Required: `id`, `version`, `description`, `serialConfig`, `memoryConfig`, `settingsSchema`, `readMemory`, `writeMemory`.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `id` | yes | object | Radio identification information |
| `version` | yes | string, pattern `^\d+\.\d+\.\d+$` | Version of the radio configuration |
| `description` | yes | string | Human-readable description of the radio configuration |
| `settingsSchema` | yes | object | Schema definitions for radio settings and channels |
| `serialConfig` | yes | object | Serial port configuration |
| `memoryConfig` | yes | object | Memory configuration for radio segments |
| `readMemory` | yes | array of protocolStep | Protocol steps for reading memory |
| `writeMemory` | yes | array of protocolStep | Protocol steps for writing memory |
| `onError` |  | onError | Optional cleanup exchanges run after a read or write failure (or cancel) |

### id

Radio identification information

Required: `model`, `name`, `manufacturer`.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `model` | yes | string | Radio model identifier |
| `name` | yes | string | Human-readable radio name |
| `manufacturer` | yes | string | Radio manufacturer name |

### settingsSchema

Schema definitions for radio settings and channels

Required: `model`, `settingsSchema`, `channelSchema`.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `model` | yes | string | Radio model identifier |
| `settingsSchema` | yes | object | JSON schema for radio settings |
| `channelSchema` | yes | object | JSON schema for radio channels |

### serialConfig

Serial port configuration

Required: `baudRate`.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `baudRate` | yes | integer, 1200–115200 | Default serial baud rate used to open the programming port. Must be included in baudRates when that list is present. |
| `baudRates` |  | array of integer, 1200–115200, min items 1, unique | Baud rates the radio programming port accepts. Omit when only baudRate is valid. The HamBench import and write dialogs show a selector when more than one value is listed. |
| `dataBits` |  | enum `5`, `6`, `7`, `8`, default `8` | Number of data bits |
| `stopBits` |  | one of the shapes below | Number of stop bits |
| `parity` |  | enum `none`, `even`, `odd`, default `none` |  |
| `rtscts` |  | boolean | Hardware RTS/CTS flow control (Kenwood TH-D74 clone on macOS) |
| `rts` |  | boolean | RTS line after open. TH-F6 live CAT needs false |
| `dtr` |  | boolean | DTR line after open |

#### stopBits

Number of stop bits

Exactly one of these shapes:


##### integer

enum `1`, `2`.


##### number

enum `1.5`.


### memoryConfig

Memory configuration for radio segments

Required: `chunkSize`, `addressSize`, `addressEndianness`, `segments`.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `chunkSize` | yes | integer, min 1 | Size of memory chunks in bytes |
| `addressSize` | yes | integer, 1–4 | Size of addresses in bytes for memory operations |
| `addressEndianness` | yes | enum `big`, `little` | Byte order for address values in memory operations |
| `segments` | yes | map of object | Memory segment definitions |

#### segments

Memory segment definitions

map of object.


##### segments entry

Required: `startAddress`, `endAddress`.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `startAddress` | yes | integer, min 0 | Starting address of the memory segment |
| `endAddress` | yes | integer, min 0 | Inclusive ending address of the memory segment |

### Definitions

#### onError

Per-operation cleanup steps. Items are send/expect exchanges only; no chunked read/write or CAT loops.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `readMemory` |  | array of exchangeStep | Cleanup exchanges after a failed or cancelled readMemory |
| `writeMemory` |  | array of exchangeStep | Cleanup exchanges after a failed or cancelled writeMemory |

#### protocolStep

A single protocol step: an exchange, a chunked read, a chunked write, or a live CAT memory loop

Exactly one of: `readStep`, `writeStep`, `catReadStep`, `catWriteStep`, `exchangeStep`.


#### byteToken

A send/expect token: a byte, hex string (0x50), ASCII opcode (S), or placeholder ($address)

Exactly one of these shapes:


##### integer

integer, 0–255.


##### string

string, min length 1.


#### sendData

Bytes and placeholders to send

array of byteToken.


#### expect

Expected serial reply: exact byte(s), opaque length, or a framed pattern

Exactly one of these shapes:


##### byteToken

See `byteToken`.


##### array

array of byteToken, min items 1.


##### bytes

Required: `bytes`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `bytes` | yes | integer, min 1 | Accept any content of this many bytes |

##### until

Required: `until`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `until` | yes | byteToken | Read until this delimiter byte; the delimiter is not included (Kenwood CAT CR) |

#### catMemory

Live CAT memory loop over logical channel records

Required: `segment`, `count`, `recordSize`, `pack`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `segment` | yes | string | Memory segment that receives packed records |
| `count` | yes | integer, min 1 | Number of channel indexes to scan |
| `recordSize` | yes | integer, min 1 | Packed logical record size in bytes |
| `pack` | yes | enum `kenwood-th-f6` | CAT reply packer |
| `indexWidth` |  | integer, 1–6, default `3` | Zero-padded decimal width of the memory index (TH-F6 uses 3) |
| `emptyByte` |  | integer, 0–255, default `255` | Fill byte for empty memories |
| `timeout` |  | integer, min 1 | Timeout in milliseconds for each CAT line |
| `interCommandDelayMs` |  | integer, min 0 | Milliseconds to wait between CAT commands |

#### catReadStep

Read memories with live CAT commands

Required: `catRead`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `description` |  | string |  |
| `catRead` | yes | catMemory |  |

#### catWriteStep

Write memories with live CAT commands

Required: `catWrite`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `description` |  | string |  |
| `catWrite` | yes | catMemory |  |

#### exchangeStep

Send bytes and/or wait for a reply

At least one of `send`, or `expect`, or `setBaudRate`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `description` |  | string | Human-readable description of the step |
| `send` |  | sendData |  |
| `expect` |  | expect |  |
| `timeout` |  | integer, min 1, default `5000` | Timeout in milliseconds |
| `delay` |  | integer, min 0 | Milliseconds to wait after send |
| `setBaudRate` |  | integer, 1200–115200 | Switch serial baud rate before send/expect (TH-D74 clone transfers at 57600) |

#### readStep

Chunked memory read

Required: `read`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `description` |  | string | Human-readable description of the step |
| `read` | yes | object, no extra fields |  |

##### read

Required: `segments`, `send`, `expect`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `segments` | yes | array of string, min items 1 | Memory segment names to read |
| `send` | yes | sendData |  |
| `expect` | yes | expect |  |
| `ack` |  | exchangeStep | Optional exchange after each chunk |
| `timeout` |  | integer, min 1 | Timeout in milliseconds for each chunk exchange |
| `delay` |  | integer, min 0 | Milliseconds to wait after each accepted chunk, including after ack |
| `ready` |  | byteToken | Byte prefixed to the next chunk when ack.expect times out. UV-5R clone uses 0x06 with ack.timeout 50 so a silent radio is not held until it answers 0xFE. |

#### writeStep

Chunked memory write

Required: `write`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `description` |  | string | Human-readable description of the step |
| `write` | yes | object, no extra fields |  |

##### write

Required: `segments`, `send`, `expect`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `segments` | yes | array of string, min items 1 | Memory segment names to write |
| `send` | yes | sendData |  |
| `expect` | yes | expect |  |
| `chunkSize` |  | integer, min 1 | Override memoryConfig.chunkSize for this write (UV-5R clone writes 16-byte blocks) |
| `delay` |  | integer, min 0 | Milliseconds to wait after each accepted block (UV-5R clone waits 50ms) |
| `skip` |  | array of object, no extra fields | Inclusive radio-address ranges that must not be uploaded |
| `timeout` |  | integer, min 1 | Timeout in milliseconds for each chunk exchange |

###### skip

Required: `startAddress`, `endAddress`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `startAddress` | yes | integer, min 0 | Inclusive start address of a skipped range |
| `endAddress` | yes | integer, min 0 | Inclusive end address of a skipped range |

<!-- /generated:protocol -->

## Fields the protocol schema does not name

Shipping configs in [radio-module-baofeng](https://github.com/springfield-ham-radio/radio-module-baofeng/blob/main/configs/baofeng-uv5r.json) and [radio-module-kenwood](https://github.com/springfield-ham-radio/radio-module-kenwood/blob/main/configs/kenwood-th-d74.json) set the fields in this section. The protocol schema allows them because its root does not forbid extra properties. There is no second JSON schema in ham-radio-utils for this section. The shapes below are the fields those configs and the registry types use.

### `$schema`

Shipping configs set `$schema` to `https://springfield-ham-radio.com/schemas/radio-config-v1.json`. Tests call `SchemaValidator.validateRadioProtocol` on the utils schema vendored above. That `$schema` string is not the `$id` of `radio-protocol-schema.json`.

### `minApiVersion`

Required by `pack:release` and by the [catalog schema](https://github.com/springfield-ham-radio/radio-module-catalog/blob/main/catalog.schema.json). Strict `major.minor.patch`. The pack script rejects a missing value and does not default it.

[ADR 0009](/developer/adr/0009-per-radio-modules) set the floor for configs that existed at the cutover to `18.0.1` and removed the old pack default of `17.3.0`. A later config can set a higher floor. Kenwood TH-D74 and TM-D710A set `18.3.0` because their `onError` cleanup needs that API ([ADR 0011](/developer/adr/0011-protocol-onerror)). Baofeng UV-5R and Kenwood TH-F6 stay on `18.0.1`.

### API version compatibility

HamBench compares the module floor with the API package it was built with.

- `APP_HAM_RADIO_API_VERSION` in [`radio-module-install.ts`](https://github.com/springfield-ham-radio/ham-radio-ui/blob/main/app/utils/radio-module-install.ts) is `hamRadioApiPackage.version`, the installed `@springfield/ham-radio-api` version. On current `main` of ham-radio-ui that dependency is `18.3.0`.
- Official install reads `minApiVersion` from the catalog entry. Local zip install reads it from the packed `configs/*.json`. A missing value, or a value that is not `major.minor.patch`, fails the install.
- `isApiVersionCompatible(installedApiVersion, minApiVersion)` in `@springfield/ham-radio-registry` is `compareSemver(installed, min) >= 0`. The app installs the module when its own API version is greater than or equal to the module floor. Otherwise it refuses the install and reports both versions.

[ADR 0005](/developer/adr/0005-module-distribution-github-catalog) describes an older literal `'17.3.0'` constant. That is not the check current HamBench runs. Do not write `17.3.0` into a new config to match that record.

Raising `minApiVersion` blocks older HamBench builds for that radio only. The catalog document's `schemaVersion` is a separate switch: current HamBench reads schema version 3 only.

### `capabilities`

`RadioCapabilities` in ham-radio-registry:

| Field | UV-5R | When to set it |
| --- | --- | --- |
| `memoryRead` | `true` | The protocol can download memory |
| `memoryWrite` | `true` | The protocol can upload memory |
| `channelProgramming` | `true` | Channel memories are editable |
| `settingsProgramming` | `true` | Radio-wide settings are editable |
| `liveControl` | omitted | Set `true` only together with a `cat` block. Live VFO is independent of clone `read` / `write` |

### `bands`

Optional array of ADIF band tokens for bands this model can transmit on. HamBench shows them on the saved radio and compares them with a logged contact. Omit the field when coverage is unknown. Do not list receive-only ranges.

Tokens used by the shipping modules and the user guide: `160m`, `80m`, `40m`, `30m`, `20m`, `17m`, `15m`, `12m`, `10m`, `6m`, `2m`, `1.25m`, `70cm`, `33cm`, `23cm`.

UV-5R sets `"bands": ["2m", "70cm"]`. The protocol schema does not enumerate these tokens.

### `codec`

| Field | Value for a new module |
| --- | --- |
| `type` | `"memoryMap"` |

`createMemoryMapCodec()` in `@springfield/ham-radio-utils` encodes and decodes. The registry type still allows `"shared"` and `"inline"` for old experiments. [ADR 0004](/developer/adr/0004-radio-modules-json-only) says new modules must not use those.

### `memoryMap`

| Field | UV-5R |
| --- | --- |
| `$ref` | `"../src/shared/memory-maps/uv5r-settings.json"` |

The path is relative to the config file. `pack:release` copies that file, and every relative `$ref` it reaches, into the radio zip. The map file itself is checked with `SchemaValidator.validateMemoryMap`.

### `metadata`

Shipping Baofeng and Kenwood configs set `author`, `license`, `homepage`, and `repository`. The registry TypeScript type `RadioConfigMetadata` also declares `moduleId`, `moduleVersion`, `pluginPath`, and `lastUpdated`. The shipping JSON does not set those four.

### `cat`

Present when `capabilities.liveControl` is `true`. HamBench uses it for the live VFO page. It is independent of `catRead` / `catWrite` memory steps ([Protocol DSL](/developer/protocols/dsl)). `RadioCatConfig` in ham-radio-registry:

| Field | Role |
| --- | --- |
| `protocol` | Command family, for example `"kenwood"` |
| `wakeCr` | Send a wake CR and discard buffered replies before `ID` |
| `vfoCount` | How many VFOs to poll. Default 1 |
| `frequencyCommands` | Frequency commands to try in order, for example `["FQ", "FO"]` |
| `frequencyWidth` | Digit width of the frequency field |
| `vfoChannel` | Frequency command is a multi-field VFO channel. Omit a separate `modeCommand` when this is true |
| `modes` | Mode names in CAT code order |
| `powers` | Power names in CAT code order, as shown on the radio |
| `modeCommand` | Separate mode command, for example `"MD"` |
| `powerBandIndex` | Pass the band index to `PC` |
| `bandControl` | Read `BC` for CTRL/PTT band |

TH-D74 sets `protocol`, `vfoCount`, `frequencyCommands`, `frequencyWidth`, `modes`, `powers`, `modeCommand`, `bandControl`, and `powerBandIndex`. Copy a block from the Kenwood config for a Kenwood-family radio. A new command family needs a driver change in `@springfield/ham-radio-driver`, not a new key invented in the module.

### `readMessage` and `writeMessage`

Optional setup text HamBench shows before Read or Write. `validateRadioDialogMessage` in `@springfield/ham-radio-api`:

| Field | Rule |
| --- | --- |
| `title` | Plain text, required when the object is present, trimmed, 1–80 characters |
| `body` | Plain text, required when the object is present, trimmed, 1–600 characters. Newlines are kept |
| `severity` | `"info"` or `"warning"`. Omit it for info |

TH-D74 sets both messages. UV-5R omits them. Control characters other than tab and newline are rejected.

## Sample config

This is the UV-5R header from `configs/baofeng-uv5r.json` at driver version `3.7.0`. The arrays in the repo are the real clone steps; they are not copied here. Read them from the [file](https://github.com/springfield-ham-radio/radio-module-baofeng/blob/main/configs/baofeng-uv5r.json) and from [Protocol DSL](/developer/protocols/dsl).

```json
{
  "$schema": "https://springfield-ham-radio.com/schemas/radio-config-v1.json",
  "id": {
    "model": "baofeng-uv5r",
    "name": "Baofeng UV-5R",
    "manufacturer": "Baofeng"
  },
  "version": "3.7.0",
  "minApiVersion": "18.0.1",
  "description": "UV-5R and UV-5RE Plus models",
  "capabilities": {
    "memoryRead": true,
    "memoryWrite": true,
    "channelProgramming": true,
    "settingsProgramming": true
  },
  "bands": ["2m", "70cm"],
  "metadata": {
    "author": "Springfield Ham Radio",
    "license": "MIT",
    "homepage": "https://springfield-ham-radio.com",
    "repository": "https://github.com/springfield-ham-radio/radio-module-baofeng"
  },
  "settingsSchema": {
    "model": "baofeng-uv5r",
    "settingsSchema": { "$ref": "../src/shared/schemas/settings-schema.json" },
    "channelSchema": { "$ref": "../src/shared/schemas/channel-schema.json" }
  },
  "memoryMap": { "$ref": "../src/shared/memory-maps/uv5r-settings.json" },
  "codec": { "type": "memoryMap" },
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
  }
}
```

A new radio starts `version` at `1.0.0`. Bump that field when the config or a file it `$ref`s changes ([ADR 0006](/developer/adr/0006-per-driver-config-semver)). The catalog `version` is this value ([ADR 0009](/developer/adr/0009-per-radio-modules)).

## Memory-map schema fields

<!-- generated:memory-map -->

Generated from `src/schemas/radio-memory-map-schema.json` in [`springfield-ham-radio/ham-radio-utils`](https://github.com/springfield-ham-radio/ham-radio-utils) at `9477e28b27a671db52869db8f3dde3c867b7c896`.

Radio Memory-Map DSL Schema. Schema for defining radio EEPROM settings layout as JSON (Chirp MEM_FORMAT as data)

Required: `structs`.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `version` |  | string | Optional map version |
| `description` |  | string |  |
| `structs` | yes | array of struct, min items 1 |  |
| `channelBindings` |  | channelBindings |  |
| `groups` |  | array of group |  |

### Definitions

#### seek

Exactly one of these shapes:


##### integer

integer, min 0.


##### string

string, pattern `^(0[xX][0-9a-fA-F]+|[0-9]+)$`.


#### channelBindings

Required: `records`, `receiveFrequency`, `transmitFrequency`, `receiveTone`, `transmitTone`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `records` | yes | string, min length 1 |  |
| `names` |  | string, min length 1 |  |
| `nameField` |  | string, min length 1 |  |
| `receiveFrequency` | yes | string, min length 1 |  |
| `transmitFrequency` | yes | string, min length 1 |  |
| `receiveTone` | yes | string, min length 1 |  |
| `transmitTone` | yes | string, min length 1 |  |
| `extras` |  | string, min length 1 |  |

#### emptyWhen

Required: `equals`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `equals` | yes | integer, 0–255 |  |

#### group

Required: `id`, `label`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `id` | yes | string, min length 1 |  |
| `label` | yes | string, min length 1 |  |
| `description` |  | string |  |
| `icon` |  | string, min length 1 |  |
| `warning` |  | object, no extra fields |  |
| `groups` |  | array of subgroup |  |

##### warning

Required: `title`, `description`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `title` | yes | string, min length 1 |  |
| `description` | yes | string, min length 1 |  |

#### subgroup

Required: `id`, `label`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `id` | yes | string, min length 1 |  |
| `label` | yes | string, min length 1 |  |
| `description` |  | string |  |

#### ui

Required: `group`, `label`, `widget`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `group` | yes | string |  |
| `subgroup` |  | string, min length 1 |  |
| `label` | yes | string |  |
| `widget` | yes | enum `integer`, `select`, `switch`, `text`, `number` |  |
| `description` |  | string |  |
| `menu` |  | object, no extra fields |  |
| `writable` |  | boolean |  |
| `order` |  | integer |  |

##### menu

Required: `number`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `number` | yes | integer, min 0 |  |
| `code` |  | string, min length 1 |  |

#### value

Exactly one of these shapes:


##### integer

Required: `kind`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `kind` | yes | const `integer` |  |
| `min` |  | number |  |
| `max` |  | number |  |

##### boolean

Required: `kind`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `kind` | yes | const `boolean` |  |

##### enum

Required: `kind`, `values`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `kind` | yes | const `enum` |  |
| `values` | yes | array of string, min items 1 |  |

##### ascii

Required: `kind`, `length`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `kind` | yes | const `ascii` |  |
| `length` | yes | integer, min 1 |  |
| `pad` |  | integer, 0–255 |  |

##### digits

Required: `kind`, `length`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `kind` | yes | const `digits` |  |
| `length` | yes | integer, min 1 |  |
| `scale` |  | number |  |

##### dtmf

Required: `kind`, `length`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `kind` | yes | const `dtmf` |  |
| `length` | yes | integer, min 1 |  |
| `charset` |  | string |  |

##### bbcd

Required: `kind`, `length`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `kind` | yes | const `bbcd` |  |
| `length` | yes | integer, min 1 |  |

##### lbcd

Required: `kind`, `length`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `kind` | yes | const `lbcd` |  |
| `length` | yes | integer, min 1 |  |
| `scale` |  | number |  |

##### tone

Required: `kind`, `values`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `kind` | yes | const `tone` |  |
| `values` | yes | array of integer, min items 1 |  |
| `ctcssMin` |  | integer |  |
| `reverseOffset` |  | integer |  |

##### ctcss-index

Required: `kind`, `values`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `kind` | yes | const `ctcss-index` |  |
| `values` | yes | array of integer, min items 1 |  |

##### dcs-index

Required: `kind`, `values`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `kind` | yes | const `dcs-index` |  |
| `values` | yes | array of integer, min items 1 |  |

#### field

Required: `id`, `type`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `id` | yes | string, min length 1 |  |
| `type` | yes | enum `u8`, `u16`, `u32`, `bits`, `char` |  |
| `width` |  | integer, 1–8 |  |
| `reserved` |  | boolean |  |
| `value` |  | value |  |
| `ui` |  | ui |  |

#### struct

Required: `id`, `seek`, `fields`.

Extra fields are rejected.

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `id` | yes | string, min length 1 |  |
| `seek` | yes | seek |  |
| `fields` | yes | array of field, min items 1 |  |
| `count` |  | integer, min 1 |  |
| `stride` |  | integer, min 1 |  |
| `groupSize` |  | integer, min 1 |  |
| `groupPad` |  | integer, min 0 |  |
| `emptyWhen` |  | emptyWhen |  |
| `clearEmpty` |  | boolean |  |

<!-- /generated:memory-map -->
