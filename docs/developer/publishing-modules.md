# Publish a radio module

Official modules are JSON zips on GitHub Releases. They are not published to npm. Users install them from the app; see [Install radios](/guide/install-radios).

## Release zip

1. Attach a JSON-only zip (`configs/`, `src/shared/schemas/`, `src/shared/memory-maps/`) to the GitHub Release (`yarn pack:release` / semantic-release).
2. Update [`radio-module-catalog`](https://github.com/springfield-ham-radio/radio-module-catalog) `catalog.json` with `version`, `downloadUrl`, `integrity` (`sha256:…`), and `minApiVersion`.

`pack:release` stamps `package.json`'s version into every `configs/*.json` `version` field before zipping. HamBench shows that value when a user installs a JSON file.

## Local development

Clone the module repo and load `configs/*.json` (resolve `$ref`s). You do not need the catalog zip until you ship.
