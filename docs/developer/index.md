# Developer docs

HamBench is a set of TypeScript packages plus JSON radio modules. The desktop app interprets those modules; you do not write a per-radio driver in TypeScript.

| Package | Role |
| --- | --- |
| [`@springfield/ham-radio-api`](https://github.com/springfield-ham-radio/ham-radio-api) | Types and schemas (protocol DSL, memory map, serial config) |
| [`@springfield/ham-radio-utils`](https://github.com/springfield-ham-radio/ham-radio-utils) | Memory-map codec, band plan, license mapping, validation |
| [`@springfield/ham-radio-driver`](https://github.com/springfield-ham-radio/ham-radio-driver) | Serial driver that executes protocol steps |
| [`@springfield/ham-radio-registry`](https://github.com/springfield-ham-radio/ham-radio-registry) | Load and validate radio configs; official catalog types |
| [`ham-radio-ui`](https://github.com/springfield-ham-radio/ham-radio-ui) | HamBench desktop app |
| [`ham-radio-sniffer`](https://github.com/springfield-ham-radio/ham-radio-sniffer) | Headless serial bridge |
| [`radio-module-baofeng`](https://github.com/springfield-ham-radio/radio-module-baofeng) / [`radio-module-kenwood`](https://github.com/springfield-ham-radio/radio-module-kenwood) | JSON radio modules |

Official modules are **JSON zips on GitHub Releases**, listed in [`radio-module-catalog`](https://github.com/springfield-ham-radio/radio-module-catalog). They are not published to npm.

## Start here

1. [Architecture](/developer/architecture-overview)
2. [Create a radio module](/developer/radio-module-dev)
3. [Protocol DSL](/developer/protocols/dsl) and [Memory-map DSL](/developer/protocols/memory-map)
4. [Publish a module](/developer/publishing-modules)

```typescript
import { RadioDriver } from '@springfield/ham-radio-driver';

const driver = new RadioDriver(radioConfig, logger);
const memory = await driver.readRadio('/dev/ttyUSB0', progressIndicator);
```
