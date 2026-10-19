# ADR 0011: Protocol `onError` cleanup steps

- **Status:** Accepted
- **Date:** 2026-10-18

## Context

Clone radios such as Kenwood TH-D74 and TM-D710A enter programming mode during `readMemory` / `writeMemory`. The success path ends with an exchange that sends `E` to leave programming mode. If a step fails or the operator cancels mid-transfer, that final `E` never runs and the radio can stay in programming mode until power cycle.

[ADR 0002](./0002-protocol-dsl.md) defines top-level protocol steps (`exchange`, `read`, `write`, `catRead`, `catWrite`). Cleanup is not a new step type; it is control flow around an existing operation. `ProtocolInterpreter.executeProtocol` today rethrows on the first step failure with no recovery. `RadioDriver.readRadio` / `writeRadio` close the port in `finally` only after `executeProtocol` settles, so a timeout while the cable is still connected still has an open port for cleanup.

Cross-repo tracking: [ham-radio-driver#23](https://github.com/springfield-ham-radio/ham-radio-driver/issues/23).

## Decision

**Shape.** Add an optional `onError` object on the radio config (and `Radio` in ham-radio-api), keyed by operation:

```ts
onError?: {
  readMemory?: RadioExchange[];
  writeMemory?: RadioExchange[];
};
```

`readMemory` and `writeMemory` stay `RadioProtocolStep[]`. The interpreter runs `protocol.onError?.[operation]` only after a step failure or user cancel. Omitted key or empty array means today’s behavior (no cleanup). Items are **exchange steps only** (`send` / `expect` / `setBaudRate` / `delay` / `timeout`). Nested `read`, `write`, `catRead`, and `catWrite` are rejected in schema so cleanup cannot start another clone loop. Literals only in docs; no `$block` / `$data` placeholders in cleanup lists.

**When it runs.**

- Run on step failure and on user cancel. Do not run on success (the success-path `E` is unchanged).
- Skip the whole list when `port.isOpen === false` (cable unplugged, device gone). The app must not hang; the radio may stay in programming mode until power cycle.
- Best-effort: swallow cleanup failures, log at warn, continue the rest of the list, then **rethrow the original error unchanged** (`CancelledException` stays `CancelledException`).
- Cap the entire cleanup list at **1500 ms** (no schema field). Send-only `E` has no `expect`; the cap bounds a wedged `write` (TH-D74 hardware flow control can stall).
- Set `context.inCleanup` while the list runs so cancel checks in `executeProtocol` and `ProtocolOperationTemplate` do not throw mid-cleanup. Do not clear the progress indicator; do not move the progress bar during cleanup. A cleanup step failure does not recurse into `onError` again.

**Baud.** Send each cleanup exchange at the port’s **current** baud unless that step sets `setBaudRate` (same as the success path). The driver does not restore `serialConfig.baudRate` after cleanup.

Kenwood **TH-D74** (read and write): `setBaudRate` **57600** (no `expect`), then `{ "description": "Leave programming mode after error", "send": ["E"] }`. Programming mode may already be at 57600 after `0M PROGRAM` even when the success-path baud switch never ran; forcing 57600 before `E` covers failure between `0M PROGRAM` and the port’s baud update.

Kenwood **TM-D710A** (read and write): plain `E` only (no baud step; session stays at open baud).

Kenwood **TH-F6**: omit `onError` (live CAT `MR` / `MW` / `MNA`; no programming mode or `E` exit). UV-5R is out of scope.

**Semver and release order (not breaking).** Optional field; existing configs and `Radio` literals remain valid.

| Repo | Release | Notes |
| --- | --- | --- |
| ham-radio-docs | no npm | ADR + DSL (this record) |
| ham-radio-api | minor **18.3.0** | `Radio.onError` |
| ham-radio-utils | minor **4.16.0** | schema + tests; after api publishes |
| ham-radio-driver | minor **3.6.0** | interpreter; depend on api `^18.3.0` |
| radio-module-kenwood | config minor | TH-D74 and TM-D710A only; `minApiVersion` **18.3.0** on those two |
| ham-radio-ui | app release | bump deps; preserve `onError` through `toRadio` and driver editor |

If another api `feat` ships before this work, Kenwood `minApiVersion` floors track the published api version, not a hardcoded `18.3.0`.

## Options considered

**Per-operation object (accepted).** Minor/additive. Read and write cleanup can differ later.

**One radio-level `onError: RadioExchange[]`.** Minor but cannot express write-only cleanup later.

**Reshape each operation to `{ steps, onError }`.** Major; breaks every config, protocol viewer, driver editor, and tests.

**`finally` hook on the interpreter.** Runs on success too and would double-send `E`.

**TH-D74 cleanup as bare `E` at current baud only.** Rejected after hardware review: if failure happens after `0M PROGRAM` but before the success-path `setBaudRate`, the radio is at 57600 and will not see `E` at 9600.

## Consequences

- TH-D74 and TM-D710A module configs gain `onError`; TH-F6 unchanged.
- Documentation: [Protocol DSL](../protocols/dsl.md) describes `onError`; [ADR 0002](./0002-protocol-dsl.md) points here for cleanup control flow (not a new step type).
- Driver and utils tests cover failure, cancel, closed port, baud, and swallowed cleanup errors ([ham-radio-driver#23](https://github.com/springfield-ham-radio/ham-radio-driver/issues/23)).
- HamBench needs driver **3.6.0** and api **18.3.0** for hardware validation; beta zips per [ADR 0010](./0010-local-beta-driver-zips.md) are enough for the module side.
