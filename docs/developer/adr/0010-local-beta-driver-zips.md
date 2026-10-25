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
- Output includes zip path, byte size, `sha256:` digest, and short git commit when available. The digest is for the email body, not part of the version string. The zip is written under `dist-release/` (same directory as `pack:release`).
- The command does not call GitHub, does not write catalog entries, does not upload, and fails if the zip exceeds 1 MiB (closure error signal).
- `$ref` closure matches `pack:release` for that one model (shared schemas and memory maps that the config reaches; sibling radios stay out). It does not use the release filter that skips a config already published on GitHub, and it does not invoke `gh`.
- `minApiVersion` on the config must be strict `major.minor.patch`. That is stricter than today's Kenwood `pack:release` check, which only requires a non-empty string. Baofeng `pack:release` already requires `major.minor.patch`.

Authors bump config `version` in git when driver bits change. `pack:beta` does not bump for them. A beta built from the same `major.minor.patch` as the catalog is **older** than that catalog entry under semver precedence below.

**Semver precedence (HamBench).** Compare install-directory versions with semver rules when a `-beta.<n>` suffix is present:

- `1.11.1-beta.1` is **older** than catalog `1.11.1` → offer **Update** to official when the catalog `minApiVersion` fits the app.
- `1.11.2-beta.1` is **newer** than catalog `1.11.1` → keep the beta; no automatic replace.
- Among betas, compare the numeric `n` (`2` is less than `10`).

`@springfield/ham-radio-registry` `compareSemver` remains numeric-only for strict `x.y.z` catalog strings. HamBench implements prerelease compare for local install paths; no registry release for this ADR.

**`minApiVersion`.** Local zip install (beta or otherwise) reads `minApiVersion` from the packed config. If it is newer than `APP_HAM_RADIO_API_VERSION`, the install is **blocked** with the same error as an official catalog install; the partial directory is rolled back.

**Catalog source and UI.**

- Beta installs stay `source: user` with badge **Beta** (not **Unverified**).
- Install dialog for `*-beta.<n>.zip`: no catalog integrity hash; show file `sha256:` and ask the tester to compare with the value from the author. Confirm label **Install beta**.
- When catalog version is greater and compatible: **Update** replaces the beta with the official zip (existing verified install path), deletes the beta version directory, badge becomes **Official**.
- When catalog version is lower than the installed beta: no **Update**, no per-radio **Switch to verified**, and the row is left out of **Switch all to verified**. Optional **Replace with official vX.Y.Z…** with a confirm that names both versions (explicit downgrade).
- **Remove** is per radio: delete catalog row and `radio-modules/<modelId>/<beta version>/` only ([ADR 0009](./0009-per-radio-modules.md)).
- Installing another local zip for the same model removes the previous module install directory after the new catalog row succeeds. Reinstalling the same `-beta.<n>` replaces that directory in place. Loose user `.json` paths are not deleted.
- A missing or non-`major.minor.patch` `minApiVersion` in a local zip fails the install.

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

## Migration

`yarn pack:beta` is in radio-module-kenwood and radio-module-baofeng (`scripts/pack-beta-zip.mjs`). HamBench shows a **Beta** badge for a user install whose version is `x.y.z-beta.n`, **Beta installed** on the catalog row, and **Install beta driver?** with the file SHA-256. Author steps: [Build a beta driver](/developer/beta-driver). Operator steps: [Install a beta driver](/guide/beta-driver).

A shared `ham-radio-pack-beta` bin is draft [ham-radio-utils#35](https://github.com/springfield-ham-radio/ham-radio-utils/pull/35), expected in `@springfield/ham-radio-utils` 4.17.0. The module scripts keep calling `scripts/pack-beta-zip.mjs` until they switch.

The bullets below described HamBench before that UI landed. They are not the current install path.

Already true at the time of this record:

- Catalog sync skips drafts and prereleases and only selects `radio-module-<id>-<major.minor.patch>.zip`.
- **Preferences → Drivers → Install from file…** installs a local zip as source `user` with badge **Unverified**. The dialog is **Install unverified module?** / **Install anyway**. It does not show a SHA-256. Local zip install does not read `minApiVersion`.
- `versionFromZipName` kept only `major.minor.patch` up to the first hyphen, so a file named `…-1.11.2-beta.1.zip` was stored as directory version `1.11.2`.
- Official catalog install already blocks when `minApiVersion` is newer than `APP_HAM_RADIO_API_VERSION`.
- Remove of one radio deletes that catalog row and, when `sourcePath` is an install directory, only that `radio-modules/<modelId>/<version>/` tree.
- `@springfield/ham-radio-registry` `compareSemver` compares numeric segments. It does not implement prerelease precedence. `parseInt` of a segment like `1-beta` is `1`, so it must not be used to order beta install directories.

Those three follow-ups have landed: Kenwood `yarn pack:beta`, Baofeng `yarn pack:beta`, and the HamBench beta install UI. `yarn pack:release` is still not a stand-in. It may list GitHub releases to skip already published versions, and it deletes existing `dist-release/radio-module-*.zip` files before writing new ones.
