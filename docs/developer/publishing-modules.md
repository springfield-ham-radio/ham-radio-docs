# Publish a radio module

Official modules are JSON zips on GitHub Releases of the manufacturer repository. They are not published to npm (`npmPublish: false`). Users install them from HamBench. See [Install radios](/guide/install-radios).

The catalog is [radio-module-catalog](https://github.com/springfield-ham-radio/radio-module-catalog), schema version 3 ([ADR 0009](/developer/adr/0009-per-radio-modules)). One catalog entry is one radio. One Release asset is one radio. [ADR 0005](/developer/adr/0005-module-distribution-github-catalog) is the earlier decision to leave npm. Its catalog shape (one zip per manufacturer, `radios`, `supportedRadios`, `catalog-module.json`) is history.

The example is Baofeng UV-5R in [radio-module-baofeng](https://github.com/springfield-ham-radio/radio-module-baofeng).

## What gets packed

`scripts/pack-release-zip.mjs` writes one zip per `configs/*.json`:

| | UV-5R |
| --- | --- |
| Config file | `configs/baofeng-uv5r.json` (`id.model` must match the file name) |
| Zip | `dist-release/radio-module-baofeng-uv5r-<config.version>.zip` |
| Zip contents | That config and the relative `$ref` closure (schemas, memory map). Sibling configs stay out. JSON only |
| Catalog `id` | `baofeng-uv5r` |
| Catalog `package` | `@springfield/radio-module-baofeng-uv5r` |
| Catalog `version` | The config's `version`, not `package.json` |
| Repo `package.json` `name` | `@springfield/radio-module-baofeng` (the repository, not the install id) |

`package` is a developer name. It is not an npm install coordinate.

Shared files under `src/shared/` are copied into each zip that `$ref`s them. They are not a separate installable package. A change to a shared schema still bumps every config that references it, and the release emits a zip for each of those radios.

`minApiVersion` is required on the config and must be `major.minor.patch`. The script fails when it is missing. UV-5R sets `18.0.1`. See [API version compatibility](/developer/config-reference#api-version-compatibility).

## Commands

semantic-release's prepare step runs:

```bash
node scripts/pack-release-zip.mjs ${nextRelease.version}
```

`nextRelease.version` is the manufacturer repo tag without the `v` (Baofeng's published UV-5R asset is on tag `v4.0.0` while the config version inside the zip is `3.7.0`). The script uses that repo version only in `downloadUrl`:

`https://github.com/springfield-ham-radio/radio-module-baofeng/releases/download/v<repo-version>/radio-module-baofeng-uv5r-<config.version>.zip`

Locally:

```bash
yarn pack:release
PACK_RELEASE_ALL=1 yarn pack:release
```

`yarn pack:release` with no argument uses `package.json` `version` for the `downloadUrl` tag. It asks `gh` for release assets and skips a config whose `version` is not greater than the highest stable asset already published for that model. If `gh` fails, it packs every config. `PACK_RELEASE_ALL=1` packs every config even when that version is already published. Use that when you need a zip to [install from file](/guide/install-radios) before the config version changes.

The script deletes `dist-release/radio-module-*.zip` before it writes. Move a beta zip aside first ([Build a beta driver](/developer/beta-driver)).

Output also includes `dist-release/catalog-entries.json`: a JSON array, one schema version 3 object per zip written in that run. It is not the full catalog document.

## Catalog entry

[catalog.schema.json](https://github.com/springfield-ham-radio/radio-module-catalog/blob/main/catalog.schema.json) requires `schemaVersion` and `modules`. Each module object requires `id`, `package`, `manufacturer`, `name`, `version`, `config`, `minApiVersion`, `downloadUrl`, and `integrity`. `description` is optional. There is no `radios` array and no `supportedRadios` list.

`integrity` is `sha256:` plus 64 hex characters, the digest of the zip bytes. `config` is the path inside the zip (`configs/baofeng-uv5r.json`).

Published UV-5R entry (the versions move when that config's `version` changes):

```json
{
  "id": "baofeng-uv5r",
  "package": "@springfield/radio-module-baofeng-uv5r",
  "manufacturer": "Baofeng",
  "name": "Baofeng UV-5R",
  "description": "Baofeng UV-5R series (UV-5R and UV-5RE Plus share one config)",
  "version": "3.7.0",
  "config": "configs/baofeng-uv5r.json",
  "minApiVersion": "18.0.1",
  "downloadUrl": "https://github.com/springfield-ham-radio/radio-module-baofeng/releases/download/v4.0.0/radio-module-baofeng-uv5r-3.7.0.zip",
  "integrity": "sha256:1481e2eb3a6f569af136533036b32d48bbbb14023a03761c859c0d42e2b674a5"
}
```

The catalog `description` can differ from the config `description`. The sync job keeps `package`, `manufacturer`, and `description` as they stand in `catalog.json` unless the config's display name changes.

Do not invent a second entry for a marketing name that shares the config. UV-5RE Plus is the UV-5R entry.

## How the catalog updates

[Update module catalog](https://github.com/springfield-ham-radio/radio-module-catalog/blob/main/.github/workflows/update-catalog.yml) runs hourly, on `workflow_dispatch`, and on `repository_dispatch` type `module-released`. For each entry it lists stable releases of the repo in `downloadUrl`, considers assets named `radio-module-<id>-<semver>.zip`, takes the highest semver, checks the SHA-256 against the release digest, requires exactly one `configs/*.json`, and requires `id.model` to equal the catalog `id`. It then sets `version`, `name`, `config`, `minApiVersion`, `downloadUrl`, and `integrity` from that zip.

A release that omits one radio does not delete that radio's catalog entry. Drafts and prereleases are ignored. There is no beta catalog. Placeholder integrity values are rejected.

`main` is protected. The workflow force-pushes `chore/sync-module-releases` and opens or updates a pull request. It does not open a pull request that changes `schemaVersion`. Merging publishes GitHub Pages at `https://springfield-ham-radio.github.io/radio-module-catalog/catalog.json`.

Check locally with `node scripts/update-catalog.mjs --dry-run` in the catalog repo.

A manufacturer repo can POST `{"event_type":"module-released"}` to `repos/springfield-ham-radio/radio-module-catalog/dispatches` after a release. The catalog repo does not store that token. The hourly run picks up the release without it.

To edit by hand: run `yarn pack:release` on the release, copy the objects from `catalog-entries.json` into `catalog.json` `modules`, and open a pull request. The usual path is the sync workflow after semantic-release uploads `dist-release/radio-module-*.zip`.

## What HamBench installs

The app fetches the Pages catalog. Install of an entry downloads that entry's zip into `radio-modules/<id>/<version>/` and loads the one config. Update compares the catalog `version` with the installed directory version. Remove deletes that radio's row and that radio's version directory. The manufacturer name is a heading. There is no manufacturer-wide zip.

HamBench on `@springfield/ham-radio-registry` 2.x reads schema version 3 only.

Listing a repository that is not already in `catalog.json` is an open question. See [Third-party and manufacturer drivers](/developer/third-party-drivers).
