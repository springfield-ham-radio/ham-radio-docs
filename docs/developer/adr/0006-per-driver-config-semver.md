# ADR 0006: Per-driver config semver

- **Status:** Accepted
- **Date:** 2026-10-10

## Context

A manufacturer zip may contain several radios (`configs/*.json`). Each file has its own protocol, memory map, and schemas via `$ref`. Users care about the version of the **driver** they installed for a given model, while the catalog advertises a single **zip** version per module ([ADR 0005](/developer/adr/0005-module-distribution-github-catalog)).

CI in module repos enforces that edits to a driver file bump its semver. Rules live in [ham-radio-ops `driver-file-version.mdc`](https://github.com/springfield-ham-radio/ham-radio-ops/blob/main/.cursor/rules/driver-file-version.mdc) and `scripts/check-driver-versions.mjs` in each module.

## Decision

**Per-config `version`.** Every `configs/*.json` has a top-level `"version"` (`major.minor.patch`). That value is the driver version HamBench displays for an installed radio. It is independent of `package.json` (module zip version) and independent of sibling configs in the same repo.

**When to bump.** Bump a config’s `version` in the same change whenever that config or any relative `$ref` it uses (schemas, memory maps) changes. A shared schema change bumps every config that references it. Unchanged sibling configs keep their versions.

**Bump guidance.**

| Change | Bump |
| --- | --- |
| New radio config | Start at `1.0.0` |
| Compatible addition (optional field, extra baud) | minor |
| Compatible fix (wrong expect byte, corrected skip) | patch |
| Incompatible protocol or layout change | major |

**CI.** `node scripts/check-driver-versions.mjs [base-ref]` fails when an existing driver’s canonical content changes without a higher version. New configs with no base revision are not compared to a prior file; starting at `1.0.0` is convention, not a script check.

**Catalog vs driver version.** `pack:release` does not copy `package.json` version onto configs. Catalog `version` tracks the zip; config `version` tracks that radio’s JSON ([Publish a module](/developer/publishing-modules)).

## Options considered

**Single module version stamped on every config.** Rejected. Unrelated radios would force meaningless version churn.

**Semver per `configs/*.json` file.** Accepted.

## Consequences

- Release notes for a module zip may mention multiple driver versions when only one config changed.
- HamBench update badges use zip version only; driver version changes inside an already-installed zip are a separate UX concern.
- Editors of shared memory maps must plan multi-config bumps when maps are shared.
