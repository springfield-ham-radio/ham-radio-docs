# ADR 0004: Radio modules are JSON only

- **Status:** Accepted
- **Date:** 2026-10-10

## Context

Official and third-party radio support is packaged as a **manufacturer module**: `configs/*.json`, shared schemas, and memory maps. HamBench loads that JSON through the registry and driver; it does not `import` TypeScript from a module zip.

[radio-module-baofeng](https://github.com/springfield-ham-radio/radio-module-baofeng) and [radio-module-kenwood](https://github.com/springfield-ham-radio/radio-module-kenwood) set `codec.type` to `"memoryMap"`, ship JSON in release zips, and use `yarn build` as a no-op. The registry still contains legacy paths (`codec.type: "shared"`, `codecFactory` on package metadata) for older experiments; no shipped Springfield module relies on them.

## Decision

**JSON-only modules.** A radio module contains:

- `configs/*.json` — protocol, serial, memory segments, schemas, and memory-map `$ref`s.
- `src/shared/schemas/*.json` and `src/shared/memory-maps/*.json` — referenced from configs.

Encode and decode use `MemoryMapRadioCodec` via `createMemoryMapCodec()` in ham-radio-utils when `codec.type` is `"memoryMap"` (or implied by a resolved memory map). The generic driver runs the Protocol DSL ([ADR 0002](./0002-protocol-dsl.md)).

**Not in the release zip.** TypeScript tests, `scripts/`, and devDependencies stay in the git repo. `yarn pack:release` archives JSON paths only.

**No per-radio driver or codec source in modules.** Do not add `src/index.ts`, `codec-factory.ts`, or executable plugins. Named driver code for protocols lives only in ham-radio-driver (executors and CAT packers per ADR 0002).

**Legacy registry hooks.** `NpmBasedConfigRegistry` may still load `codec.type: "shared"` for Node workspaces. New modules must not use that path.

## Options considered

**npm package with compiled codec per manufacturer.** Superseded for distribution ([ADR 0005](./0005-module-distribution-github-catalog.md)).

**Shared codec referenced from each module’s TypeScript.** Rejected for new work.

**JSON configs + generic memory-map codec + shared protocol interpreter.** Accepted.

## Consequences

- Module CI focuses on schema validation, driver-version checks, and codec round-trips over JSON fixtures.
- Documentation for [Create a radio module](/developer/radio-module-dev) and [Plugin development](/developer/registry/plugin-development) describes JSON layout only.
- Any new escape hatch from JSON (new step type or packer) is a library change, not a module script.
