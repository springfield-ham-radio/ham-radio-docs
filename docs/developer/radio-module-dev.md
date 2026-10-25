# Create a radio module

The end-to-end path is [Build a radio driver](/developer/build-a-radio-driver). This page is the repository layout those steps fill in. The worked example is [radio-module-baofeng](https://github.com/springfield-ham-radio/radio-module-baofeng) `configs/baofeng-uv5r.json`.

A module is JSON only. Encode and decode use `createMemoryMapCodec()` in `@springfield/ham-radio-utils`. The generic driver in `@springfield/ham-radio-driver` runs the protocol. Tests may use TypeScript. They are not part of the zip.

## Layout

```
radio-module-baofeng/
├── package.json
├── configs/
│   └── baofeng-uv5r.json
├── src/shared/
│   ├── schemas/
│   │   ├── channel-schema.json
│   │   └── settings-schema.json
│   └── memory-maps/
│       └── uv5r-settings.json
├── scripts/
│   ├── pack-release-zip.mjs
│   └── pack-beta-zip.mjs
└── test/
    ├── unit/
    └── integration/
```

`configs/<id.model>.json` is one radio. UV-5R and UV-5RE Plus share `baofeng-uv5r`, so they are one file. The header, including `minApiVersion`, is the [sample config](/developer/config-reference#sample-config). Every field is the [Radio config reference](/developer/config-reference).

## package.json

The manufacturer repo name stays on the repository. The catalog `package` is per radio (`@springfield/radio-module-baofeng-uv5r`) and is not an npm coordinate. Do not set `main`, `types`, or a codec factory path.

```json
{
  "name": "@springfield/radio-module-baofeng",
  "description": "Radio module for Baofeng UV-5R series ham radios (DSL JSON configs)",
  "files": ["configs/", "src/shared/schemas/", "src/shared/memory-maps/"],
  "scripts": {
    "build": "node -e \"console.log('json-only radio module; nothing to build')\"",
    "pack:release": "node scripts/pack-release-zip.mjs",
    "pack:beta": "node scripts/pack-beta-zip.mjs"
  },
  "springfield": {
    "pluginType": "radio-module",
    "manufacturer": "Baofeng",
    "configPath": "configs",
    "sharedPath": "src/shared",
    "supportedRadios": ["baofeng-uv5r"],
    "capabilities": {
      "dslProtocols": true,
      "memoryRead": true,
      "memoryWrite": true,
      "channelProgramming": true,
      "settingsProgramming": true
    }
  }
}
```

`springfield.supportedRadios` is repository metadata. The catalog does not have a `supportedRadios` list. One config file is one catalog entry.

`package.json` `version` is the git tag semantic-release publishes. Each config's `version` is that radio's driver version and the zip version. `pack:release` writes one zip per config and `dist-release/catalog-entries.json`. See [Publish a module](/developer/publishing-modules). `yarn pack:beta baofeng-uv5r` writes a local beta zip. See [Build a beta driver](/developer/beta-driver).

## What HamBench loads

The app downloads the zip, keeps JSON only, and uses:

1. The protocol steps with the generic driver.
2. `codec.type: "memoryMap"` and the referenced map with `createMemoryMapCodec()`.

No TypeScript from the module is imported.

Draft the protocol in the desktop app before you fill this layout. **View → Developer Mode** opens the Driver page. See [Driver editor](/developer/driver-editor).
