# ADR 0013: Memory-map special channels

- **Status:** Proposed
- **Date:** 2026-11-27

## Context

[ADR 0003](./0003-memory-map-dsl.md) defines `channelBindings` on a memory map so HamBench can decode and edit a repeating channel struct array as portable `RadioChannel` records. Some clone radios keep **special** memories in the **same** struct array immediately after the regular programmable channels. The row count in the map (`count` on the binding or the bound segment) therefore spans both regular channels and specials, but only the regular slots are meant for add, drag-reorder, and slot-shift.

**Kenwood TH-D74** is the motivating model:

| Index range | Role |
| --- | --- |
| 0–999 | Regular programmable channels |
| 1000–1099 | L0/U0 … L49/U49 programmable scan edges (L *n* = 1000+2*n*, U *n* = 1001+2*n*) |
| 1100 | Pri (priority channel) |
| 1101+ | Weather channels (present on the radio; not modeled in HamBench) |

Before this change, HamBench treated every decoded record from index `0` through `count - 1` as a normal channel. Raising `count` to include scan edges and Pri let **Add channel** or **shift** operations write into those indices and corrupt specials on write-back.

## Decision

**Schema.** Add an optional `channelBindings.specials` object on a memory map:

```json
"specials": {
  "start": 1000,
  "labels": ["L0", "U0", "…", "L49", "U49", "Pri"]
}
```

- **`start`** — First memory index that is not a regular programmable channel. It is also the **regular channel capacity**: indices `0 … start - 1` are regular; indices `start … count - 1` are specials labeled by `labels`.
- **`labels`** — One string per special index. `labels[i]` names index `start + i`.

**Validation.** When `specials` is present:

- `start + labels.length` must equal the channel record count (the binding `count` or the length of the decoded channel array).
- The same equality must hold for parallel bound arrays (`names`, `extras`, or other `channelBindings` fields tied to channel rows) when those fields are present.

When `specials` is absent, behavior is unchanged: every record up to the count is a regular channel.

**Runtime and UI.**

- Special rows appear in a dedicated, labeled section in the Channels UI. They remain editable (frequencies and fields) and clearable like other memories, but HamBench never targets them for **add**, **drag-reorder**, or **slot-shift**.
- Codec and driver logic must not treat specials as spare slots when growing or compacting the regular list.

**Driver semver.** A module that declares `specials` must raise `minApiVersion` on that radio config to the HamBench release that ships the api/utils versions implementing this contract (same pattern as [ADR 0011](./0011-protocol-onerror.md) for additive memory-map features).

**Implementation (in flight).**

| Repo | Pull request |
| --- | --- |
| [ham-radio-api](https://github.com/springfield-ham-radio/ham-radio-api) | [PR 42](https://github.com/springfield-ham-radio/ham-radio-api/pull/42) |
| [ham-radio-utils](https://github.com/springfield-ham-radio/ham-radio-utils) | [PR 51](https://github.com/springfield-ham-radio/ham-radio-utils/pull/51) |

Follow-up work: [ham-radio-ui ADR 0030](https://github.com/springfield-ham-radio/ham-radio-ui/blob/main/docs/adr/0030-memory-map-special-channels.md) (Channels UI sectioning) and the **radio-module-kenwood** TH-D74 memory map update that sets `specials` for scan edges and Pri.

## Consequences

- Maps without `specials` need no change; existing radios keep today’s channel list semantics.
- TH-D74 (and any future radio with trailing specials in the channel array) can expose the full on-radio row count without risking silent overwrite of scan edges or Pri during regular channel maintenance.
- Authors must keep `start`, `labels`, and record `count` aligned; schema validation fails fast on drift.
- Documentation for the Memory-Map DSL should describe `channelBindings.specials` once the api/utils changes merge; this ADR is the cross-repo contract record ([ADR 0003](./0003-memory-map-dsl.md) remains the parent decision for the DSL itself).