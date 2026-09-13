# Plugin development

Radio modules are JSON packages, not npm libraries with executable plugins. HamBench never loads TypeScript from a module.

Follow [Create a radio module](/developer/radio-module-dev) for layout, config fields, and the memory-map codec.

## What to ship

| Path | Role |
| --- | --- |
| `configs/*.json` | One radio: protocol, serial, memory, `cat`, schemas, memory-map `$ref` |
| `src/shared/schemas/*.json` | Channel and settings schemas (`$ref` from the config) |
| `src/shared/memory-maps/*.json` | Memory-map DSL (`codec.type: "memoryMap"`) |

Do not add `src/index.ts`, `codec-factory.ts`, or `*.ts` codecs. Encode/decode is `MemoryMapRadioCodec` in `@springfield/ham-radio-utils`.

## Naming

- Official: `@springfield/radio-module-{manufacturer}`
- Third-party: `radio-module-{manufacturer}` or `@scope/radio-module-{manufacturer}`
- `springfield.pluginType` must be `"radio-module"`

## Publish

JSON zip on GitHub Releases (`yarn pack:release`), then update [`radio-module-catalog`](https://github.com/springfield-ham-radio/radio-module-catalog). See [Publish a module](/developer/publishing-modules).
