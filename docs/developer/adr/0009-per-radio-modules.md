# ADR 0009: One installable package per radio

- **Status:** Proposed
- **Date:** 2026-10-13

## Context

Each manufacturer repository ships one JSON zip that contains every radio from that manufacturer. [radio-module-kenwood](https://github.com/springfield-ham-radio/radio-module-kenwood) puts TH-D74, TH-F6, and TM-D710A in `radio-module-kenwood-<version>.zip`. [radio-module-baofeng](https://github.com/springfield-ham-radio/radio-module-baofeng) puts the UV-5R config (the same file covers UV-5RE Plus) in `radio-module-baofeng-<version>.zip`. [radio-module-catalog](https://github.com/springfield-ham-radio/radio-module-catalog) lists one catalog entry per zip (`id` `kenwood` and `baofeng`). HamBench extracts that zip to `radio-modules/<moduleId>/<version>/` and stores every radio from it with the same `sourcePath`.

The preferences UI removes one radio at a time. [`uninstallRadioCatalogRecord`](https://github.com/springfield-ham-radio/ham-radio-ui/blob/main/app/utils/radio-module-install.ts) treats a shared `sourcePath` as the whole module: it deletes every catalog row with that path, then [`uninstall_radio_module`](https://github.com/springfield-ham-radio/ham-radio-ui/blob/main/src-tauri/src/radio_modules.rs) runs `remove_dir_all` on the version directory. Removing the TH-F6 deletes every Kenwood radio ([ham-radio-ui#116](https://github.com/springfield-ham-radio/ham-radio-ui/issues/116)). Install can already limit hydration to one `configs/*.json`, and Update on a manufacturer group still downloads the shared zip.

The repos stay one per manufacturer. Shared protocol and CAT behavior must stay maintainable. Today that split is already in place for executable code: manufacturer zips are JSON only ([ADR 0004](./0004-radio-modules-json-only.md)), and Kenwood CAT execution lives in `@springfield/ham-radio-driver`. Inside a manufacturer repo the shared files are JSON. Kenwood's three configs `$ref` one `channel-schema.json` and one `settings-schema.json`; each radio has its own memory map, protocol steps, and `cat` block. Baofeng has a single config.

Two versions exist on purpose ([ADR 0006](./0006-per-driver-config-semver.md)). The catalog `version` is the manufacturer zip (`package.json` / semantic-release tag). Each `configs/*.json` `version` is the driver version HamBench displays. Update badges compare the zip version. Kenwood's published catalog pin is zip `1.11.2` while the configs are `1.11.1` (TH-D74) and `1.11.0` (TH-F6, TM-D710A). Baofeng's catalog pin is zip `3.7.2` while `baofeng-uv5r.json` is `3.7.0`.

`minApiVersion` is the minimum `@springfield/ham-radio-api` version. HamBench compares it with `compareSemver` to `APP_HAM_RADIO_API_VERSION`, which is the installed API package version (18.0.1 in current HamBench). The catalog and `pack-release-zip.mjs` still pin `17.3.0` when `springfield.minApiVersion` is unset. `@springfield/ham-radio-registry` 1.7.3 accepts catalog `schemaVersion` 1 and 2 as the same document. The published catalog is schema version 1, with `radios[]` and a duplicate `supportedRadios` list.

## Decision

**One repository per manufacturer. One installable package per radio.** The git repos remain `radio-module-kenwood` and `radio-module-baofeng`. The catalog entry, the GitHub Release asset, the on-disk directory, and the uninstall unit are one radio.

**Identity.**

| Radio config | Catalog `id` and install directory | `package` (not an npm coordinate) | Release asset |
| --- | --- | --- | --- |
| `configs/kenwood-th-f6.json` | `kenwood-th-f6` | `@springfield/radio-module-kenwood-th-f6` | `radio-module-kenwood-th-f6-<version>.zip` |
| `configs/kenwood-th-d74.json` | `kenwood-th-d74` | `@springfield/radio-module-kenwood-th-d74` | `radio-module-kenwood-th-d74-<version>.zip` |
| `configs/kenwood-tm-d710a.json` | `kenwood-tm-d710a` | `@springfield/radio-module-kenwood-tm-d710a` | `radio-module-kenwood-tm-d710a-<version>.zip` |
| `configs/baofeng-uv5r.json` | `baofeng-uv5r` | `@springfield/radio-module-baofeng-uv5r` | `radio-module-baofeng-uv5r-<version>.zip` |

`id` is `id.model`. UV-5R and UV-5RE Plus stay one package because they share one config. The manufacturer repo's own `package.json` `name` stays `@springfield/radio-module-kenwood` or `@springfield/radio-module-baofeng`. That name is the repo, not the install id.

**Artifact version.** The catalog `version`, the zip filename, and the install directory version are the config `version` from [ADR 0006](./0006-per-driver-config-semver.md). The manufacturer repo still uses semantic-release for its git tag and changelog ([ADR 0008](./0008-versioning-and-releases.md)). That tag is only the Release that holds the assets. A Kenwood tag `v1.12.0` may attach `radio-module-kenwood-th-d74-1.12.0.zip` and leave TH-F6 on an older asset whose config version did not change. Update compares that radio's catalog version with its installed directory version.

**Zip contents.** `pack:release` writes one zip per `configs/*.json`. The zip contains that config and the `$ref` closure (schemas, memory maps, and any later shared protocol JSON), using the same relative paths the repo already uses. Sibling radios and unreferenced maps stay out of the zip. The archive remains JSON only.

**Shared manufacturer files are copied into each zip. They are not a second installable package.** Authors edit `src/shared/` once in the manufacturer repo. A change to a shared schema still bumps every config that `$ref`s it, and the release emits a new zip for each of those radios. Protocol and CAT executors stay in `@springfield/ham-radio-driver`, shipped with HamBench. A future shared Kenwood command sequence is a JSON file under `src/shared/` referenced with `$ref`, then copied into each zip that uses it.

**Catalog schema version 3.** One object per radio. Fields: `id`, `package`, `manufacturer`, `name`, `description` (optional), `version`, `config`, `minApiVersion`, `downloadUrl`, `integrity`. `radios[]` and `supportedRadios` are removed. `config` is the path inside that zip (`configs/<model>.json`). `minApiVersion` is required on the config JSON and copied into the catalog entry. The pack script's silent default of `17.3.0` goes away. At the cutover, each shipping config sets `minApiVersion` to `18.0.1`.

Registry 1.7.3 already accepts schema version 2 as an alias of version 1. This change uses **schema version 3** so a current HamBench fails closed instead of reading the new document as a manufacturer bundle. The registry release that implements this ADR accepts only schema version 3.

**HamBench.** Download, integrity, and JSON-only extraction stay as in [ADR 0005](./0005-module-distribution-github-catalog.md). The install directory is `radio-modules/<modelId>/<configVersion>/`. A zip with anything other than one `configs/*.json` is refused. Install of a catalog entry installs that radio. Update is per radio. Remove deletes that radio's catalog row and that radio's version directory.

**Cutover.** The first launch of the HamBench build that implements this ADR deletes official installs of the bundled modules and does not read them. It removes app-data directories `radio-modules/kenwood/` and `radio-modules/baofeng/`, and it deletes `radio_models` rows whose `source_path` is under those directories. HamBench does **not** auto-reinstall those drivers. The operator reinstalls manually from the new catalog. Saved radios (`ham-radio-saved-radios`), channel library, station log, stations, antennas, and image backups stay. Local user JSON (`source` `user`, path ending in `.json`) stays. There is no reader for schema version 1, for `supportedRadios`-only entries, or for short model ids such as `uv5r`.

**Updates in the UI.** Update is per radio. The manufacturer name is a grouping heading only; there is no manufacturer-wide Update that installs one shared zip.

**`minApiVersion` on configs.** Every current shipping config sets top-level `minApiVersion` to `18.0.1`.

**Package naming.** Repo `package.json` `name` stays manufacturer-scoped (`@springfield/radio-module-kenwood` / `@springfield/radio-module-baofeng`). Catalog `package` is per radio (`@springfield/radio-module-<modelId>`).

**Stable catalog only.** Catalog sync continues to skip prereleases when resolving release assets. There is no separate beta catalog.

**How this fixes #116.** TH-F6 and TH-D74 no longer share a `sourcePath` or a version directory. `uninstallRadioCatalogRecord` removes the row for `kenwood-th-f6`. `uninstall_radio_module` removes `radio-modules/kenwood-th-f6/<version>/` only.

## Options considered

**Reference-count the manufacturer directory and delete it when the last radio is gone.** Fixes the delete side of #116 and leaves the catalog as one zip per manufacturer. Install and update would still download every Kenwood radio to remove one. Rejected. The install unit should be the radio the UI already shows.

**One git repository per radio.** Gives independent releases and no shared-file problem inside the repo. Rejected. Shared Kenwood schemas and protocol JSON would be copied across repositories. The owner decision is one repository per manufacturer.

**Publish shared schemas as a catalog dependency that each radio zip requires.** One installed copy of `channel-schema.json`, with radios depending on it. Uninstall then needs reference counts across packages, which is the #116 failure mode moved to a dependency. JSON `$ref`s would also cross install directories. Rejected.

**Keep schema version 1 and put a single-element `radios[]` on each entry.** Current HamBench could download the new zips. It would still group updates by manufacturer and still accept the old bundled ids. Rejected. The cutover is one format.

**Redefine schema version 2.** Registry 1.7.3 treats version 2 as version 1. A new shape under version 2 is easy to misread. Schema version 3 is the new document.

**Stamp every radio zip with the manufacturer repo version.** One semantic-release number for every asset. An unchanged TH-F6 would publish a new catalog version whenever TH-D74 changed. Rejected. [ADR 0006](./0006-per-driver-config-semver.md) already versions the driver operators see. That version becomes the artifact version.

## Consequences

Breaking changes, all intentional:

1. **Catalog document.** Published `catalog.json` moves to `schemaVersion` 3. Schema versions 1 and 2 are invalid. `radios[]` and `supportedRadios` are gone. HamBench builds on `@springfield/ham-radio-registry` 1.x cannot parse the catalog.
2. **Registry package.** `@springfield/ham-radio-registry` catalog types break. The implementation ships as 2.0.0. `RadioModuleCatalogEntry` is one radio. `parseModuleCatalog` rejects schema versions 1 and 2 and rejects entries that only have `supportedRadios`.
3. **Install identity.** On-disk ids `kenwood` and `baofeng` are retired. Official installs live at `radio-modules/<modelId>/<configVersion>/`.
4. **Artifact version.** Catalog `version` is the radio config version. It is no longer the manufacturer `package.json` version or the git tag. A Release tag may differ from every asset version it carries.
5. **Release assets.** A manufacturer Release attaches one zip per radio that changed. Catalog sync selects assets by model id across releases. It no longer assumes the latest tag has a single zip whose tag is the module version.
6. **Zip layout.** A release zip contains one config and the files it `$ref`s. Multi-config zips, including local installs of today's manufacturer zips, are refused.
7. **Installed modules on disk.** The new HamBench deletes `radio-modules/kenwood/`, `radio-modules/baofeng/`, and the `radio_models` rows that point at them. It does not auto-reinstall removed drivers. Operators reinstall manually. Saved radios, channels, the log, stations, antennas, and image backups remain. User-installed JSON files remain.
8. **Model id matching.** Short catalog ids (`uv5r` matching `baofeng-uv5r`) are not accepted. `id` is the config `id.model`.
9. **`minApiVersion`.** Each config declares it. The pack default `17.3.0` is removed. The cutover value is `18.0.1`, matching the API version current HamBench embeds. A radio can later raise its own floor without republishing siblings.
10. **Update control.** The manufacturer-group Update action that installs one shared entry goes away. Each radio updates from its own catalog entry.

Further consequences:

- `@springfield/ham-radio-api` and `@springfield/ham-radio-driver` do not need a release for the split. Config JSON, Protocol DSL, and CAT executors stay as they are. `minApiVersion` is an extra field on the config file; `validateConfiguration` does not reject unknown fields, so this is not an API major.
- Raising `minApiVersion` still blocks older HamBench builds for that radio only. The schema version 3 cutover blocks older builds for the whole catalog, which is a coarser switch than `minApiVersion`.
- Shared schema edits still bump every referencing config ([ADR 0006](./0006-per-driver-config-semver.md)) and publish one zip per bumped radio. Zip bytes repeat the schema. The source file does not.
- Author and operator docs that still say "one zip per manufacturer" ([Publish a module](/developer/publishing-modules), [Create a radio module](/developer/radio-module-dev), [Install radios](/guide/install-radios), and the distribution notes in [ADR 0005](./0005-module-distribution-github-catalog.md)) are updated when this ADR is accepted, in a follow-up. This record does not change those pages.
- [ham-radio-ui#116](https://github.com/springfield-ham-radio/ham-radio-ui/issues/116) is fixed by the install unit, not by a special case in uninstall.

## Migration

Implement in this order. Manufacturer release jobs that stop uploading the combined zip wait until the registry, catalog, and HamBench changes land together. Until that window, `main` on the module repos keeps today's single zip.

### 1. ham-radio-docs

This record. After it is accepted, update the author and operator pages listed under Consequences so they describe per-radio assets and schema version 3. Leave [ADR 0004](./0004-radio-modules-json-only.md), [ADR 0005](./0005-module-distribution-github-catalog.md), and [ADR 0006](./0006-per-driver-config-semver.md) as history; point forward to this ADR from the pages that operators and module authors follow.

### 2. ham-radio-registry

Publish `@springfield/ham-radio-registry` 2.0.0 before HamBench depends on it.

- Replace `RadioModuleCatalogEntry` with the schema version 3 fields. Drop `radios` and `supportedRadios`.
- `SUPPORTED_SCHEMA_VERSIONS` becomes schema version 3 only.
- Delete the branch that synthesizes `radios` from `supportedRadios`.
- Reject a duplicate `id` anywhere in the catalog (ids are model ids, so this also rejects duplicate radios).
- Keep `compareSemver` and `isApiVersionCompatible` unchanged.
- Update `radio-configuration-discovery-proposal.md` to the new shape.

No change to `hydrateRadioConfig` or `validateConfiguration`.

### 3. radio-module-kenwood and radio-module-baofeng

Same pack change in both repos. Kenwood is the multi-radio case. Baofeng has one config and still changes asset name, catalog id, and version source.

- Add top-level `minApiVersion` `18.0.1` to each `configs/*.json`.
- Change `scripts/pack-release-zip.mjs` to emit one zip per config:
  - Name `radio-module-<modelId>-<config.version>.zip`.
  - Include `configs/<file>.json` and every relative `$ref` it reaches, and nothing else.
  - Fail when `minApiVersion` is missing, when `configs/*.json` is missing `id.model`, `id.name`, or `version`, or when the `$ref` closure escapes the repo.
  - Write `dist-release/catalog-entries.json` as an array of schema version 3 entries. `version` is the config version. `downloadUrl` uses the semantic-release tag passed into the script (`v<repo version>`), not the config version.
- semantic-release `assets` glob becomes `dist-release/radio-module-*.zip`. `npmPublish` stays false. The repo `package.json` name stays manufacturer-scoped.
- `scripts/check-driver-versions.mjs` stays. A shared schema edit fails CI until every referencing config version increases. `pack:release` emits a zip only for configs whose version is new relative to the previous Release's assets for that model. Unchanged radios are left on their existing Release asset.
- Do not add a Yarn workspace package per radio.

First per-radio Release assets use each config's `version` in the manufacturer repos at the time of this ADR:

| Asset | Config version |
| --- | --- |
| `radio-module-kenwood-th-f6-1.11.0.zip` | `1.11.0` |
| `radio-module-kenwood-th-d74-1.11.1.zip` | `1.11.1` |
| `radio-module-kenwood-tm-d710a-1.11.0.zip` | `1.11.0` |
| `radio-module-baofeng-uv5r-3.7.0.zip` | `3.7.0` |

Those config versions are lower than today's bundled catalog pins (Kenwood zip `1.11.2`, Baofeng `3.7.2`). That is acceptable: catalog and install `version` follow [ADR 0006](./0006-per-driver-config-semver.md) driver semver, not the retired manufacturer zip version.

Those first assets ship on the next manufacturer git tag. They replace the combined zip. Older tags keep the historical combined zips; the new catalog does not link to them.

### 4. radio-module-catalog

- Set `schemaVersion` to 3. Replace the two module objects with four radio entries from the table in Decision.
- Rewrite `catalog.schema.json`. Required fields are `id`, `package`, `manufacturer`, `name`, `version`, `config`, `minApiVersion`, `downloadUrl`, `integrity`. Remove `radios` and `supportedRadios`.
- Rewrite `scripts/update-catalog.mjs`. For each entry, resolve the GitHub repo from `downloadUrl`. List published Releases, skip drafts and prereleases (no beta catalog; stable sync only), and consider every asset named `radio-module-<id>-<semver>.zip`. Choose the highest semver. Download it, require the release digest to match the bytes, require exactly one `configs/*.json`, and require `id.model` to equal the catalog `id`. Set `version`, `name`, `config`, `minApiVersion`, `downloadUrl`, and `integrity` from that asset. Leave `package`, `manufacturer`, and `description` as maintained in `catalog.json` unless the zip's config name changes.
- The latest Release is allowed to omit a radio. Absence means "no new asset", not "remove the catalog entry".
- Extend `scripts/update-catalog.test.mjs` with a Kenwood fixture whose latest Release contains only one of the three zips.
- Merge this to `main` in the same window as the HamBench release below. GitHub Pages will serve schema version 3 as soon as it merges, and current HamBench will reject that document.

### 5. ham-radio-ui

Depend on `@springfield/ham-radio-registry` 2.x.

- `installOfficialModule` downloads that entry's zip into `radio-modules/<entry.id>/<entry.version>/` and upserts the single config. Remove the `catalogModelId` / `catalogConfig` filter.
- `list_config_paths` requires exactly one JSON file under `configs/`.
- `uninstallRadioCatalogRecord` deletes that model row and, when the row's `sourcePath` is an install directory, calls `uninstall_radio_module` for that directory only. It does not query for sibling rows with the same path.
- `buildInstalledRadioListItems` matches a row to a catalog entry by model id (`entry.id`). Update is available when the catalog version is greater than the installed directory version. `groupInstalledRadiosByManufacturer` stays a heading. Drop the group Update handler that calls `installOfficialModule` once for the whole manufacturer. Each radio has its own Update.
- On startup, if `radio-modules/kenwood` or `radio-modules/baofeng` exists, delete those directories and the `radio_models` rows whose `source_path` is under them. Then the existing empty-catalog install flow can run. Do not copy files into the new directories and do not auto-download.
- Remove `catalogModelMatchesId` short-id matching.
- Local `.json` install is unchanged. Local zip install uses the same one-config rule and skips catalog integrity, still marked unverified.
- Close [ham-radio-ui#116](https://github.com/springfield-ham-radio/ham-radio-ui/issues/116) with this behavior.

### 6. ham-radio-api

No release. Radio config types stay. `minApiVersion` on the JSON is read by the pack script and the catalog updater, not by the API package.

### 7. ham-radio-driver

No release. `catRead` / `catWrite` and the Kenwood `cat` block stay here and inside each radio config. Shared manufacturer behavior that is JSON moves by `$ref` inside the manufacturer repo, then into each zip.
