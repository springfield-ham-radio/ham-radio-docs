# Publish a radio module

Official modules are JSON zips on GitHub Releases. They are not published to npm. Users install them from the app; see [Install radios](/guide/install-radios).

## Release zip

1. Attach a JSON-only zip (`configs/`, `src/shared/schemas/`, `src/shared/memory-maps/`) to the GitHub Release (`yarn pack:release` / semantic-release). One zip per manufacturer.
2. `pack:release` writes `dist-release/catalog-module.json` from the `configs/*.json` files in that zip (`modelId`, `name`, `config`). Copy that object into [`radio-module-catalog`](https://github.com/springfield-ham-radio/radio-module-catalog) `catalog.json`, or update `version`, `downloadUrl`, `integrity`, `radios`, and `supportedRadios` to match.

`pack:release` leaves each `configs/*.json` `version` as that radio's driver version. HamBench shows that value on the installed driver. The catalog `version` is the zip version from `package.json`, and that is what the Update marker compares.

Do not list radios that are not files in `configs/`. If two marketing names share one config (for example UV-5R and UV-5RE Plus), the catalog lists that config once.

## Local development

Clone the module repo and load `configs/*.json` (resolve `$ref`s). You do not need the catalog zip until you ship.
