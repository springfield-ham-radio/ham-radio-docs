# Architecture decision records

Decisions that change a layer, a runtime, or a public contract live here. Each record states the context, the decision, and the consequences. The user guide stays the place for operator steps.

| Record | Status | Decision |
| --- | --- | --- |
| [ADR 0001](/developer/adr/0001-rewrite-sniffer-in-rust) | Accepted | Rewrite the sniffer in Rust |
| [ADR 0002](/developer/adr/0002-protocol-dsl) | Accepted | Protocol DSL (JSON serial steps) |
| [ADR 0003](/developer/adr/0003-memory-map-dsl) | Accepted | Memory-Map DSL |
| [ADR 0004](/developer/adr/0004-radio-modules-json-only) | Accepted | Radio modules are JSON only |
| [ADR 0005](/developer/adr/0005-module-distribution-github-catalog) | Accepted | Module distribution via GitHub catalog |
| [ADR 0006](/developer/adr/0006-per-driver-config-semver) | Accepted | Per-driver config semver |
| [ADR 0007](/developer/adr/0007-mit-license-no-chirp-code) | Accepted | MIT license; no copied CHIRP code |
| [ADR 0008](/developer/adr/0008-versioning-and-releases) | Accepted | Versioning and releases |

## Repository ADRs

Some decisions apply to a single repository rather than the whole ecosystem. Those records live in that repo under `docs/adr/`, not in this catalog.

| Repository | Example |
| --- | --- |
| [ham-radio-ui](https://github.com/springfield-ham-radio/ham-radio-ui) | [ADR 0001: Location model](https://github.com/springfield-ham-radio/ham-radio-ui/blob/main/docs/adr/0001-location-model.md) (lands with [PR #84](https://github.com/springfield-ham-radio/ham-radio-ui/pull/84); the link is the expected path on `main`) |
