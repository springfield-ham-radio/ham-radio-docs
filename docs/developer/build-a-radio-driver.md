# Build a radio driver

This is the path from a radio on the bench to a HamBench module. The example is the Baofeng UV-5R config that [radio-module-baofeng](https://github.com/springfield-ham-radio/radio-module-baofeng) already ships. Field lists, the protocol language, the memory map, tests, and the catalog each have their own page. This page is the order to do the work, and the links.

A module is JSON only ([ADR 0004](/developer/adr/0004-radio-modules-json-only)). Encode and decode go through `createMemoryMapCodec()` in `@springfield/ham-radio-utils`. The generic driver in `@springfield/ham-radio-driver` runs the protocol steps. HamBench does not import TypeScript from the zip.

## Prerequisites

- A radio you are allowed to read and write, and its programming cable. The hardware checklist in [Test a radio driver](/developer/testing-a-radio-driver) assumes you can put the original memories back.
- [HamBench](/guide/getting-started) installed, so you can use the Driver editor and **Install from file**.
- [ham-radio-sniffer](https://github.com/springfield-ham-radio/ham-radio-sniffer) when you need a byte capture. The app can install that binary. See [Sniffer](/guide/sniffer).
- Node.js 26.10.0 (the `.nvmrc` in `radio-module-baofeng`, `radio-module-kenwood`, and `ham-radio-utils`) and Yarn. Module repos set `packageManager` in `package.json`.

Read [ADR 0007](/developer/adr/0007-mit-license-no-chirp-code) before you look at another project's driver for ideas. Springfield modules are MIT. Do not paste CHIRP or other GPL source into the repo, and do not commit CHIRP's image files as test fixtures. Re-express a layout you understand as JSON. Captures you commit must be your own dumps, or another contributor's rights-clear captures.

## The example you are copying

| Piece | UV-5R |
| --- | --- |
| Repository | [`radio-module-baofeng`](https://github.com/springfield-ham-radio/radio-module-baofeng) |
| Config | [`configs/baofeng-uv5r.json`](https://github.com/springfield-ham-radio/radio-module-baofeng/blob/main/configs/baofeng-uv5r.json) |
| `id.model` | `baofeng-uv5r` |
| Driver `version` | `3.7.0` in that file today. A new radio starts at `1.0.0` |
| `minApiVersion` | `18.0.1` |
| Memory map | [`src/shared/memory-maps/uv5r-settings.json`](https://github.com/springfield-ham-radio/radio-module-baofeng/blob/main/src/shared/memory-maps/uv5r-settings.json) |
| Channel and settings schemas | `src/shared/schemas/` |
| Codec | `{ "type": "memoryMap" }` |

UV-5R and UV-5RE Plus are one config, so they are one installable package. Two marketing names that share a file are listed once.

Repo layout and `package.json` are on [Create a radio module](/developer/radio-module-dev). The header fields, including `minApiVersion`, are the [sample config](/developer/config-reference#sample-config).

## 1. Capture traffic

Use the sniffer when the programming protocol is not already written down. [Sniffer](/guide/sniffer) is the connection and install steps. For a clone-style radio such as the UV-5R, the capture you want is one full memory read and one full memory write from a cable you trust (the manufacturer's software, or HamBench once a draft protocol runs).

1. **Preferences → Sniffer**, then **Radio → Sniffer**. Computer port is the debug cable. Radio port is the programming cable. Turn on **Bridge ports**.
2. Run a memory read in the software on the computer side. **Save capture**. The file kind is `springfield-ham-radio-sniffer-capture`. Prefer the `log` array (`SEND` / `RECV`) when you compare it with a HamBench serial log.
3. Change one channel, or one setting, and capture a second read. The Driver editor's Debug tab diffs two clones. That diff is where the field lives in the image. It is not written into the protocol JSON.

The UV-5R read in the shipping config is four steps: a fixed magic exchange that expects `0x06`, an ident read of 8 bytes, a begin-clone exchange, then a chunked `read` of the `channels` and `settings` segments (`S` / `X` frames, 64-byte chunks). Match those frames to your capture before you change them. The full steps are in the config file and in [Protocol DSL](/developer/protocols/dsl).

Disconnect live CAT on a port before sniffing that port.

## 2. Draft in the Driver editor

[Driver editor](/developer/driver-editor) is **View → Developer Mode** in HamBench. The form writes serial settings, memory segments, protocol steps, the channel schema, and the memory map.

For this example, **Load installed** on an installed UV-5R module fills the Channel and Memory tabs from the real files. **Example** loads a short built-in clone driver, which is a blank to learn the form, not the UV-5R protocol. **Import** opens a JSON file if you already have a draft. **Export** writes the protocol document. Copy the channel schema and the memory map from their tabs into `src/shared/`. The protocol document keeps only the paths.

Segment addresses and skip ranges are hex in the form and numbers in the JSON. `endAddress` is inclusive.

## 3. Protocol

Put the exported protocol in `configs/<model>.json`. The UV-5R model id is `baofeng-uv5r`, so the file is `configs/baofeng-uv5r.json`. `pack:release` rejects any other file name for that `id.model`.

Write the steps in the [Protocol DSL](/developer/protocols/dsl): exchanges (`send` / `expect`), chunked `read` / `write`, and, for a radio that programs memories with live CAT instead of a clone dump, `catRead` / `catWrite`. The UV-5R module does not use CAT. Kenwood TH-F6 does. That is a different module. Stay on the UV-5R file while you learn the shape.

Set `serialConfig` from the capture. UV-5R opens at 9600 8N1 and does not list `baudRates`. Set `memoryConfig.segments` to the address ranges the chunk loop walks. UV-5R uses `channels` `0–6143` and `settings` `7872–8191`, `chunkSize` 64, `addressSize` 2, `addressEndianness` `"big"`. The write step uses its own `chunkSize` of 16 and skips two ranges. Those numbers are properties of this radio. Take them from your capture and from a read you can decode, and check them against the shipping file when you are studying this example.

`onError` is optional cleanup after a failed or cancelled transfer. UV-5R omits it. See [ADR 0011](/developer/adr/0011-protocol-onerror) before you add it. Adding it is a reason to raise `minApiVersion`.

Every field the schema knows, and the module fields it does not list, is on the [Radio config reference](/developer/config-reference). Set `minApiVersion` to `18.0.1` unless the protocol uses a newer API. Set `codec.type` to `"memoryMap"`. Set `version` to `1.0.0` for a new radio.

`capabilities` for UV-5R turns on memory read, memory write, channel programming, and settings programming. It leaves `liveControl` off. `bands` is `["2m", "70cm"]` because those are the amateur bands this model transmits on. Omit `bands` when you do not know.

## 4. Memory map and settings

The memory map turns image bytes into channels and settings. Author it with the [Memory-map DSL](/developer/protocols/memory-map). Point `memoryMap.$ref` at the file, relative to the config. UV-5R uses `../src/shared/memory-maps/uv5r-settings.json`.

`settingsSchema.settingsSchema` and `settingsSchema.channelSchema` are `$ref`s to JSON Schema files under `src/shared/schemas/`. UV-5R uses `../src/shared/schemas/settings-schema.json` and `../src/shared/schemas/channel-schema.json`. `settingsSchema.model` is `baofeng-uv5r`.

UV-5R's map groups, in order, are `basic`, `advanced`, `workmode`, `other`, `dtmf`, and `service`. Those ids are the Settings tab sections. A radio-wide field's `ui.group` matches a top-level group `id`. Nested `groups` plus `ui.subgroup` are headed sections inside the panel. Per-channel extras use `channel`.

Addresses in the map are radio EEPROM addresses. For UV-5R, a CHIRP image offset is 8 bytes higher than the radio address. The memory-map page has that conversion. Do not copy CHIRP `MEM_FORMAT` source. Re-express the layout.

Validate the map with `SchemaValidator.validateMemoryMap` and the config with `SchemaValidator.validateRadioProtocol`. Kenwood's `test/unit/radio-config-schema.test.ts` is the pattern: load every `configs/*.json` and expect `valid`.

## 5. Tests

[Test a radio driver](/developer/testing-a-radio-driver) is the fixture rule, the Vitest layout in `radio-module-baofeng`, and the hardware checklist. Do the unit round-trip before you write the radio. Do the hardware checklist before you call the driver done. The tests stay in the git repo. They are not in the release zip.

## 6. Package a zip

From the module repo:

```bash
yarn install
PACK_RELEASE_ALL=1 yarn pack:release
```

`PACK_RELEASE_ALL=1` builds a zip even when GitHub already has that config version. The command writes one zip per config:

`dist-release/radio-module-<modelId>-<config.version>.zip`

For this example that name is `radio-module-baofeng-uv5r-3.7.0.zip` when the config version is `3.7.0`. The zip contains that config and the `$ref` files it reaches (schemas and the memory map). It does not contain sibling radios, tests, or `package.json`.

It also writes `dist-release/catalog-entries.json`, a JSON array of [catalog schema version 3](/developer/publishing-modules) entries. Details, including what happens without `PACK_RELEASE_ALL`, are on that page.

`yarn pack:release` deletes other `radio-module-*.zip` files already in `dist-release/` before it writes. Copy a beta zip out of that directory first.

## 7. Hand a tester a beta zip

`yarn pack:beta <modelId> [n]` writes `dist-release/radio-module-<modelId>-<version>-beta.<n>.zip` without publishing a Release. For the UV-5R example that is `yarn pack:beta baofeng-uv5r`. The working-tree `version` stays `x.y.z`. The copy inside the zip is `<version>-beta.<n>`.

[Build a beta driver](/developer/beta-driver) is the command, the 1 MiB limit, and the stdout (`path`, size, `sha256:`, git commit). Testers install that file with [Install a beta driver](/guide/beta-driver). HamBench labels it **Beta**. It is not a catalog entry. Version order is `1.11.1-beta.1` < `1.11.1` < `1.11.2-beta.1`.

`pack:beta` leaves other files in `dist-release/` alone. `pack:release` does not.

## 8. Install from file

In HamBench, **Preferences → Drivers → Install from file…** accepts the zip, or a single config JSON next to the files it `$ref`s. [Install radios](/guide/install-radios) has the dialog. The app labels a local file **Unverified** and does not update it from the catalog. That is the right way to try the zip you just built.

The zip must contain exactly one `configs/*.json`. Add the radio under **Preferences → Radios**, then run the [hardware checklist](/developer/testing-a-radio-driver#hardware-test-checklist).

## 9. Publish

When the hardware checklist passes, publish through [Publish a module](/developer/publishing-modules). A manufacturer Release attaches one zip per radio whose config version increased. The catalog entry's `version` is that config version, not the git tag. Users install from **Preferences → Drivers**.

Official listing of a repository the catalog does not already track is not decided. See [Third-party and manufacturer drivers](/developer/third-party-drivers).
