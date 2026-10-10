# ADR 0005: Module distribution via GitHub catalog

- **Status:** Accepted
- **Date:** 2026-10-10

## Context

HamBench must install official radios without publishing module bytes to npm. Libraries (`@springfield/ham-radio-api`, `@springfield/ham-radio-utils`, `@springfield/ham-radio-driver`, `@springfield/ham-radio-registry`) remain public npm packages for application and tool development. **Radio modules** are a separate artifact: a JSON zip on GitHub Releases, indexed by [radio-module-catalog](https://github.com/springfield-ham-radio/radio-module-catalog).

The registry proposal [`radio-configuration-discovery-proposal.md`](https://github.com/springfield-ham-radio/ham-radio-registry/blob/main/radio-configuration-discovery-proposal.md) and ham-radio-ui install code describe the current design. Older ham-radio-docs pages still described npm-based module discovery; those are corrected in the same change set as this ADR.

`NpmBasedConfigRegistry` and `DefaultNpmClient` remain for scanning `node_modules` in Yarn workspaces; they are not how the desktop app installs official modules.

## Decision

**Distribution.** Official modules ship as JSON-only zips attached to GitHub Releases (`yarn pack:release`, semantic-release with `npmPublish: false`). The canonical index is [`catalog.json`](https://github.com/springfield-ham-radio/radio-module-catalog/blob/main/catalog.json) on GitHub Pages (`https://springfield-ham-radio.github.io/radio-module-catalog/catalog.json`). The hourly [Update module catalog](https://github.com/springfield-ham-radio/radio-module-catalog/blob/main/.github/workflows/update-catalog.yml) workflow (and `repository_dispatch` type `module-released`) refreshes entries via pull request; it does not push directly to protected `main`.

**Catalog fields.** Each module entry includes `version` (zip / package release), `downloadUrl`, `integrity` (`sha256:` + 64 hex), `minApiVersion`, `radios` (from `configs/*.json`), and `supportedRadios`. The `package` string is a developer name (`@springfield/radio-module-baofeng`), not an npm install coordinate.

**HamBench install (official).** The app fetches the catalog, checks `minApiVersion` against the compile-time constant `APP_HAM_RADIO_API_VERSION` in [`radio-module-install.ts`](https://github.com/springfield-ham-radio/ham-radio-ui/blob/main/app/utils/radio-module-install.ts) (distinct from the `@springfield/ham-radio-api` version in `package.json`), downloads over HTTPS from an allowlisted host set (`github.com`, GitHub release asset hosts, and `springfield-ham-radio.github.io`), verifies SHA-256, and extracts **only** `.json` files into app data `radio-modules/<moduleId>/<version>/`. See [`radio_modules.rs`](https://github.com/springfield-ham-radio/ham-radio-ui/blob/main/src-tauri/src/radio_modules.rs).

**Updates.** The preferences UI compares catalog `version` to the installed zip directory version ([`radio-module-listing.ts`](https://github.com/springfield-ham-radio/ham-radio-ui/blob/main/app/utils/radio-module-listing.ts)), not each config’s driver `version` ([ADR 0006](/developer/adr/0006-per-driver-config-semver)).

**Local zip.** Users may install a local zip without catalog integrity; that path is explicitly unverified.

**Supersedes.** Designing official radio modules as npm packages discoverable via the npm registry is **superseded** by this catalog + GitHub Release model.

## Options considered

**Publish `radio-module-*` to npm and discover with `NpmClient`.** Superseded. Module `package.json` keeps `npmPublish: false`.

**GitHub Release zip + signed catalog index.** Accepted.

## Consequences

- New official modules require a catalog PR (or sync workflow merge) after release.
- Docs and diagrams that show “install from npm” for **modules** must point here or to [Publish a module](/developer/publishing-modules).
- Node developers clone module repos or use workspace scans; they do not `npm install` the manufacturer zip.
- Raising `minApiVersion` blocks older HamBench builds until the app ships a compatible API constant and dependency bump.
