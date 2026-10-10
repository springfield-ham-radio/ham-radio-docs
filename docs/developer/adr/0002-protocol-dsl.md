# ADR 0002: Protocol DSL

- **Status:** Accepted
- **Date:** 2026-10-10

## Context

HamBench talks to radios over serial using a shared driver. Each radio describes its clone or CAT workflow as JSON steps beside `serialConfig` and `memoryConfig` in the module config. The desktop app and tests load that JSON; modules do not ship executable driver code.

The step vocabulary, schema, and interpreter already exist across [ham-radio-api](https://github.com/springfield-ham-radio/ham-radio-api) (`RadioProtocolStep` in [`src/radio/protocol.ts`](https://github.com/springfield-ham-radio/ham-radio-api/blob/main/src/radio/protocol.ts)), [ham-radio-utils](https://github.com/springfield-ham-radio/ham-radio-utils) ([`radio-protocol-schema.json`](https://github.com/springfield-ham-radio/ham-radio-utils/blob/main/src/schemas/radio-protocol-schema.json)), and [ham-radio-driver](https://github.com/springfield-ham-radio/ham-radio-driver) ([`protocol-interpreter.ts`](https://github.com/springfield-ham-radio/ham-radio-driver/blob/main/src/protocol-interpreter.ts) and [`src/executors/`](https://github.com/springfield-ham-radio/ham-radio-driver/tree/main/src/executors)). Shipped configs include Baofeng UV-5R, Kenwood TH-F6, TH-D74, and TM-D710A.

[ham-radio-ui#60](https://github.com/springfield-ham-radio/ham-radio-ui/issues/60) (Icom IC-2730A) needs behavior the current step union cannot express: unsolicited streamed frames after clone-out, per-frame checksums, and high-speed baud changes. That work is not implemented yet; this ADR records the DSL we use today and how to extend it.

Authoritative operator and field reference: [Protocol DSL](/developer/protocols/dsl) and [Protocols overview](/developer/protocols/).

## Decision

**Protocol DSL.** Radio I/O is a JSON array of typed steps (`readMemory` / `writeMemory`). There is no text grammar and no per-radio TypeScript driver. The interpreter dispatches each step to a built-in executor.

**Step types in use.** Top-level steps are: `exchange` (send / expect / `setBaudRate` / `delay` / `timeout`), chunked `read`, chunked `write`, `catRead`, and `catWrite`. Shape of `expect` is inferred (token, array, `{ bytes: N }`, `{ until: token }`). Byte tokens, placeholders (`$address`, `$block`, `$chunkSize`, `$length`, `$data`), inclusive `endAddress`, and `addressSize` / `addressEndianness` are defined in the types and schema; see the linked spec.

**Extending the DSL (convention from this date forward).** A new wire behavior that does not fit an existing step requires a new step type shipped together in:

1. `ham-radio-api` — extend `RadioProtocolStep` and related types.
2. `ham-radio-utils` — extend `radio-protocol-schema.json` and tests.
3. `ham-radio-driver` — add an executor and register it in [`StepExecutorRegistry`](https://github.com/springfield-ham-radio/ham-radio-driver/blob/main/src/executors/registry.ts) (cat read/write before read/write before exchange).
4. Documentation in ham-radio-docs and tests in the driver and affected modules.

`ProtocolInterpreter.registerExecutor` and [`custom-step-example.ts`](https://github.com/springfield-ham-radio/ham-radio-driver/blob/main/src/examples/custom-step-example.ts) are for in-process experiments only. JSON modules cannot register custom executors.

**Packers (named code exception).** Live CAT memory loops may set `pack` on `catRead` / `catWrite`. Only [`kenwood-th-f6`](https://github.com/springfield-ham-radio/ham-radio-driver/blob/main/src/utils/cat-packers.ts) is implemented today. Packers turn CAT line replies into a fixed memory-map record; they are not a substitute for a new clone step type (for example Icom streamed frames).

## Options considered

**Text grammar or per-radio driver code.** Rejected. Every new radio would fork serial logic instead of editing JSON.

**Per-module TypeScript executors.** Rejected for distribution. Modules are JSON-only ([ADR 0004](/developer/adr/0004-radio-modules-json-only)).

**Model new protocols only as another packer.** Rejected when the wire shape is not “one CAT command → one line.” Streamed clone protocols need a dedicated step type.

**Shared JSON interpreter plus coordinated library releases for new step types.** Accepted.

## Consequences

- New radios extend existing step types where possible; otherwise the org ships a library release with the new step before a module can use it.
- Documentation and the protocol editor stay aligned with `radio-protocol-schema.json`, not with ad hoc executor names.
- Icom IC-2730A and similar radios are tracked as new step work ([issue #60](https://github.com/springfield-ham-radio/ham-radio-ui/issues/60)), not as module-only changes.
- CAT timeout defaults (2000 ms in driver helpers) and exchange timeout defaults (5000 ms in [`protocol-operations.ts`](https://github.com/springfield-ham-radio/ham-radio-driver/blob/main/src/utils/protocol-operations.ts)) remain implementation details documented in the Protocol DSL page, not duplicated here.
