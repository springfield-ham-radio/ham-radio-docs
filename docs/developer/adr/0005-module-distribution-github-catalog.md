# ADR 0005: Module distribution via GitHub catalog

- **Status:** Accepted
- **Date:** 2026-10-10

**Later decision.** [ADR 0009](./0009-per-radio-modules.md) replaces the one-zip-per-manufacturer catalog described below (`radios`, `supportedRadios`, one zip per manufacturer). Author steps follow [Publish a module](/developer/publishing-modules). This record stays as the decision to leave npm.

## Context

HamBench must install official radios without publishing module bytes to npm. Libraries (`@springfield/ham-radio-api`, `@springfield/ham-radio-utils`, `@springfield/ham-radio-driver`, `@springfield/ham-radio-registry`) remain public npm packages for application and tool development. **Radio modules** are a separate artifact: a JSON zip on GitHub Releases, indexed by [radio-module-catalog](https://github.com/springfield-ham-radio/radio-module-catalog).

The registry proposal [`radio-configuration-discovery-proposal.md`](https://github.com/springfield-ham-radio/ham-radio-registry/blob/main/radio-configuration-discovery-proposal.md) and ham-radio-ui install code describe the current design. Older ham-radio-docs pages still described npm-based module discovery; those are corrected in the same change set as this ADR.

`NpmBasedConfigRegistry` and `DefaultNpmClient` remain for scanning `node_modules` in Yarn workspaces; they are not how the desktop app installs official modules.

## Decision

**Distribution.** Official modules ship as JSON-only zips attached to GitHub Releases (`yarn pack:release`, semantic-release with `npmPublish: false`). The canonical index is [`catalog.json`](https://github.com/springfield-ham-radio/radio-module-catalog/blob/main/catalog.json) on GitHub Pages (`https://springfield-ham-radio.github.io/radio-module-catalog/catalog.json`). The hourly [Update module catalog](https://github.com/springfield-ham-radio/radio-module-catalog/blob/main/.github/workflows/update-catalog.yml) workflow (and `repository_dispatch` type `module-released`) refreshes entries via pull request; it does not push directly to protected `main`.

**Catalog fields.** Each module entry includes `version` (zip / package release), `downloadUrl`, `integrity` (`sha256:` + 64 hex), `minApiVersion`, `radios` (from `configs/*.json`), and `supportedRadios`. The `package` string is a developer name (`@springfield/radio-module-baofeng`), not an npm install coordinate.

**HamBench install (official).** The app fetches the catalog, checks `minApiVersion` against `APP_HAM_RADIO_API_VERSION` (the literal `'17.3.0'` in [`radio-module-install.ts`](https://github.com/springfield-ham-radio/ham-radio-ui/blob/main/app/utils/radio-module-install.ts)), which is separate from the app’s `@springfield/ham-radio-api` dependency (`^18.0.1` in `package.json`). Downloads use HTTPS only from `github.com`, `objects.githubusercontent.com`, `release-assets.githubusercontent.com`, or `springfield-ham-radio.github.io`. The installer verifies the zip against the catalog `integrity` (`sha256:` + hex digest of the zip bytes; `catalog.json` itself is not signed), then extracts **only** `.json` files into app data `radio-modules/<moduleId>/<version>/`. See [`radio_modules.rs`](https://github.com/springfield-ham-radio/ham-radio-ui/blob/main/src-tauri/src/radio_modules.rs).

**Updates.** The preferences UI compares catalog `version` to the installed zip directory version ([`radio-module-listing.ts`](https://github.com/springfield-ham-radio/ham-radio-ui/blob/main/app/utils/radio-module-listing.ts)), not each config’s driver `version` ([ADR 0006](./0006-per-driver-config-semver.md)).

**Local zip.** Users may install a local zip without catalog integrity; that path is explicitly unverified.

**Supersedes.** Designing official radio modules as npm packages discoverable via the npm registry is **superseded** by this catalog + GitHub Release model.

## Options considered

**Publish `radio-module-*` to npm and discover with `NpmClient`.** Superseded. Module `package.json` keeps `npmPublish: false`.

**GitHub Release zip + catalog index with per-zip SHA-256 integrity.** Accepted.

## Consequences

- New official modules require a catalog PR (or sync workflow merge) after release.
- Docs and diagrams that show “install from npm” for **modules** must point here or to [Publish a module](/developer/publishing-modules).
- Node developers clone module repos or use workspace scans; they do not `npm install` the manufacturer zip.
- Raising `minApiVersion` blocks older HamBench builds until the app ships a compatible API constant and dependency bump.
