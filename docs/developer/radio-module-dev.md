# Create a radio module

A HamBench radio module is **JSON only**. It does not ship executable code. Encode and decode use `MemoryMapRadioCodec` in `@springfield/ham-radio-utils`. The generic driver in `@springfield/ham-radio-driver` runs the protocol DSL.

Ship `configs/`, `src/shared/schemas/`, and `src/shared/memory-maps/` in a GitHub Release zip. Tests may use TypeScript; they are not part of the zip.

## Layout

```
radio-module-example/
├── package.json
├── configs/
│   └── example-radio.json
├── src/shared/
│   ├── schemas/
│   │   ├── channel-schema.json
│   │   └── settings-schema.json
│   └── memory-maps/
│       └── example-settings.json
└── test/
    ├── unit/
    └── integration/
```

See [`radio-module-baofeng`](https://github.com/springfield-ham-radio/radio-module-baofeng) and [`radio-module-kenwood`](https://github.com/springfield-ham-radio/radio-module-kenwood).

## package.json

```json
{
  "name": "@springfield/radio-module-example",
  "version": "1.0.0",
  "description": "JSON radio module",
  "files": ["configs/", "src/shared/schemas/", "src/shared/memory-maps/"],
  "springfield": {
    "pluginType": "radio-module",
    "manufacturer": "Example",
    "configPath": "configs",
    "sharedPath": "src/shared",
    "capabilities": {
      "dslProtocols": true,
      "memoryRead": true,
      "memoryWrite": true
    }
  }
}
```

Do not set `main`, `types`, or a codec factory path. There is no module entrypoint.

You can draft the protocol in the desktop app before you fill in this layout. **View → Developer Mode** opens a Driver page whose form writes serial settings, memory segments, protocol steps, the channel schema, and the memory map, including settings groups. **Load installed** fills the Channel and Memory tabs from a module that is already installed. Copy the protocol JSON into `configs/`, and copy the schema and memory map from their tabs. See [Driver editor](/developer/driver-editor).

## Radio JSON

Each `configs/*.json` file is one radio. It owns protocol steps, serial settings, memory segments, schema `$ref`s, a memory-map `$ref`, and `codec.type: "memoryMap"`.

```json
{
  "id": {
    "model": "example-radio",
    "name": "Example Radio",
    "manufacturer": "Example"
  },
  "version": "1.0.0",
  "capabilities": {
    "memoryRead": true,
    "memoryWrite": true,
    "channelProgramming": true,
    "settingsProgramming": true,
    "liveControl": false
  },
  "settingsSchema": {
    "model": "example-radio",
    "settingsSchema": { "$ref": "../src/shared/schemas/settings-schema.json" },
    "channelSchema": { "$ref": "../src/shared/schemas/channel-schema.json" }
  },
  "memoryMap": { "$ref": "../src/shared/memory-maps/example-settings.json" },
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
      "channels": { "startAddress": 0, "endAddress": 1023 }
    }
  },
  "readMemory": [],
  "writeMemory": []
}
```

- Protocol: [Protocol DSL](/developer/protocols/dsl) (`send`/`expect`, `read`/`write`, or `catRead`/`catWrite`).
- Memory packing: [Memory-map DSL](/developer/protocols/memory-map). Declare `groups` on the map so the Settings tab can show labeled sections in the left nav; nested `groups` plus field `ui.subgroup` become headed sections in the panel. Each field `ui.group` matches a top-level group `id`.
- Live VFO: set `capabilities.liveControl` and a `cat` block. That is still JSON, not code.
- If the PC port accepts more than one baud, list `serialConfig.baudRates` and set `baudRate` to the default.

Each config's `version` is that radio's driver version. Bump it when the config or a file it `$ref`s changes. `package.json` is the zip version published to the catalog; `pack:release` does not copy it onto configs. `pack:release` writes `dist-release/catalog-module.json` from those configs for the official catalog index.

## What HamBench loads

The desktop app downloads the zip, keeps JSON only, and uses:

1. The protocol steps with the generic driver
2. `codec.type: "memoryMap"` plus the referenced map with `createMemoryMapCodec()` from `@springfield/ham-radio-utils`

No TypeScript from the module is imported or executed.

## Tests

Tests live in the module repo and may import HamBench packages. They are not shipped in the release zip.

```typescript
import { createMemoryMapCodec } from '@springfield/ham-radio-utils';
import { MockLogLayer } from 'loglayer';

const codec = createMemoryMapCodec({
  radioModel: config.id.model,
  memoryMap,
  memoryConfig: config.memoryConfig,
  logger: new MockLogLayer(),
});
```

## Publish

See [Publish a module](/developer/publishing-modules). Users install from the app: [Install radios](/guide/install-radios).
