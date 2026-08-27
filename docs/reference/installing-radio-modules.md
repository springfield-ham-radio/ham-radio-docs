# Installing radio modules

The Ham Radio desktop app ships a generic **RadioDriver**. Per-radio support is provided by **radio modules** (JSON configs, schemas, and memory maps). Users install only the modules for radios they own.

## Official install (recommended)

1. On first launch (empty catalog), the app opens **Install radios**.
2. The app fetches the official catalog from GitHub Pages:
   `https://springfield-ham-radio.github.io/radio-module-catalog/catalog.json`
3. Select modules and click **Install**.
4. The app downloads each module zip from GitHub Releases, verifies `sha256:…` integrity, extracts JSON only under the app data directory, and adds radios to the local SQLite catalog as source `installed`.

Later, open **Preferences → Radios → Install radios…** to add more official modules.

The generic driver is **not** downloaded. Only JSON radio-module packages are installed.

## Local file install (unsupported)

Use **Install from file…** to install a module zip (same layout as GitHub Release assets) or a single radio config JSON (with sibling `$ref` files).

Before install, the app shows an **at your own risk** warning. Local installs are stored as source `user` and labeled **Unverified**. They are not updated from the official catalog.

Offline first launch: the official catalog may be unreachable; local file install still works.

## Developer install (npm)

Module authors and Node tooling continue to use npm:

```bash
yarn add @springfield/radio-module-baofeng
```

The desktop app does **not** run `yarn add` at runtime. See [Radio Module Development](/reference/radio-module-dev) for packaging.

## Publishing a module for the app

1. Publish the npm package as usual.
2. Attach a JSON-only zip (`configs/`, `src/shared/schemas/`, `src/shared/memory-maps/`) to the GitHub Release (`yarn pack:release` / semantic-release).
3. Update [`radio-module-catalog`](https://github.com/springfield-ham-radio/radio-module-catalog) `catalog.json` with `version`, `downloadUrl`, `integrity`, and `minApiVersion`.
