# ADR 0010: Local beta driver zips

- **Status:** Accepted
- **Date:** 2026-10-16

## Context

[ADR 0009](./0009-per-radio-modules.md) ships one installable zip per radio. The stable catalog on GitHub Pages lists only release assets whose version is strict `major.minor.patch`; catalog sync skips drafts and prereleases. There is no beta catalog.

Authors still need to hand a single radio zip to a tester before merge and release. Email (or any file transfer) must work without publishing a GitHub Release, without updating [`radio-module-catalog`](https://github.com/springfield-ham-radio/radio-module-catalog), and without attaching the zip to semantic-release on the manufacturer repo `beta` branch ([ADR 0008](./0008-versioning-and-releases.md) — that path publishes a manufacturer-repo prerelease, not a per-radio beta for HamBench).

HamBench already installs a local zip without catalog integrity ([ADR 0005](./0005-module-distribution-github-catalog.md)). That path is labeled **Unverified**. Beta zips need a distinct label, semver-correct comparison to the official catalog entry, and predictable update and remove behavior.

## Decision

**Build command (manufacturer repos).** `yarn pack:beta <modelId> [n]` builds one zip for that radio:

- `n` defaults to `1` (positive integer, no leading zero).
- Working-tree `configs/<modelId>.json` `version` stays strict `major.minor.patch` ([ADR 0006](./0006-per-driver-config-semver.md)). The command refuses a working-tree prerelease.
- Packed version is `<config.version>-beta.<n>` in both the zip filename (`radio-module-<modelId>-<version>.zip`) and the config JSON inside the zip. The working tree is not modified; the suffix is applied when copying the `$ref` closure into a temp tree before zipping.
- Build metadata in the version (`+sha` or similar) is rejected.
- Output includes zip path, byte size, `sha256:` digest, and short git commit when available. The digest is for the email body, not part of the version string.
- The command does not call GitHub, does not write catalog entries, does not upload, and fails if the zip exceeds 1 MiB (closure error signal).
- Same validation and `$ref` closure rules as `pack:release` for that model.

Authors bump config `version` in git when driver bits change. `pack:beta` does not bump for them. A beta built from the same `major.minor.patch` as the catalog is **older** than that catalog entry under semver precedence below.

**Semver precedence (HamBench).** Compare install-directory versions with semver rules when a `-beta.<n>` suffix is present:

- `1.11.1-beta.1` is **older** than catalog `1.11.1` → offer **Update** to official when the catalog `minApiVersion` fits the app.
- `1.11.2-beta.1` is **newer** than catalog `1.11.1` → keep the beta; no automatic replace.
- Among betas, compare the numeric `n` (`2` &lt; `10`).

`@springfield/ham-radio-registry` `compareSemver` remains numeric-only for strict `x.y.z` catalog strings. HamBench implements prerelease compare for local install paths; no registry release for this ADR.

**`minApiVersion`.** Local zip install (beta or otherwise) reads `minApiVersion` from the packed config. If it is newer than `APP_HAM_RADIO_API_VERSION`, the install is **blocked** with the same error as an official catalog install; the partial directory is rolled back.

**Catalog source and UI.**

- Beta installs stay `source: user` with badge **Beta** (not **Unverified**).
- Install dialog for `*-beta.<n>.zip`: no catalog integrity hash; show file `sha256:` and ask the tester to compare with the value from the author. Confirm label **Install beta**.
- When catalog version is greater and compatible: **Update** replaces the beta with the official zip (existing verified install path), deletes the beta version directory, badge becomes **Official**.
- When catalog version is lower than the installed beta: no **Update**; optional **Replace with official vX.Y.Z…** with a confirm that names both versions (explicit downgrade).
- **Remove** is per radio: delete catalog row and `radio-modules/<modelId>/<beta version>/` only ([ADR 0009](./0009-per-radio-modules.md)).
- Installing another local zip for the same model removes the previous module install directory after the new catalog row succeeds; loose user `.json` paths are not deleted.

**Non-beta local zips** keep today's **Unverified** dialog and behavior except the shared `minApiVersion` block and directory cleanup on replace.

**Documentation.** Author steps: [Build a beta driver](/developer/beta-driver). Operator steps: [Install a beta driver](/guide/beta-driver).

**Relation to ADR 0009.** Local betas are not catalog entries. [ADR 0009](./0009-per-radio-modules.md) stable-catalog-only rule is unchanged.

## Options considered

**Beta catalog or GitHub Release prerelease assets in catalog sync.** Rejected in ADR 0009; unchanged.

**Warn on `minApiVersion` mismatch but install anyway.** Rejected; the app cannot run the driver and testers file false bugs.

**Treat beta zips as Unverified.** Rejected; operators cannot distinguish email betas from arbitrary JSON.

**Put git sha in the version string.** Rejected; awkward on disk and semver `+` metadata does not sort usefully for compare.

## Consequences

- Manufacturer repos add `pack:beta` (Kenwood and Baofeng first).
- HamBench changes version parsing, listing, install dialog, and replace/downgrade actions per above.
- Breaking: zip versions with `-beta.<n>` use full string as install directory; local install enforces `minApiVersion`; replacing a local module removes the prior install directory.
- Registry `compareSemver` unchanged.
