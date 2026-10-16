# Build a beta driver

Use this when you want a tester to try one radio’s driver in HamBench **before** you publish a GitHub Release or change the official catalog. The contract is [ADR 0010](/developer/adr/0010-local-beta-driver-zips). Send testers to [Install a beta driver](/guide/beta-driver).

This is not the manufacturer repo `beta` branch release ([ADR 0008](/developer/adr/0008-versioning-and-releases)). Do not attach the zip to a Release or run semantic-release for a handoff.

**`yarn pack:beta` is not in the module repos yet.** It lands in a later pull request to [`radio-module-kenwood`](https://github.com/springfield-ham-radio/radio-module-kenwood), then the same change in [`radio-module-baofeng`](https://github.com/springfield-ham-radio/radio-module-baofeng). Until those merge, `package.json` has `pack:release` only. Do not invent the zip by renaming a release asset: HamBench does not treat `-beta.<n>` as its own install version until the ham-radio-ui change in [ADR 0010](/developer/adr/0010-local-beta-driver-zips) migration.

The rest of this page is the command those pull requests add.

## Before you pack

1. Work in the Kenwood or Baofeng module repo.
2. Bump the target `configs/<modelId>.json` `version` when you change that config or any file its `$ref`s reach ([ADR 0006](/developer/adr/0006-per-driver-config-semver)). `pack:beta` does not bump for you. The working-tree version stays strict `major.minor.patch`. The command refuses a prerelease already written in the file.
3. Set `minApiVersion` to strict `major.minor.patch`. The beta command requires that shape. Kenwood `pack:release` today only checks that the field is non-empty; Baofeng `pack:release` already requires `major.minor.patch`. After the HamBench change, a beta whose `minApiVersion` is newer than the tester’s app is refused.

If you pack without bumping and the config version already matches the catalog, the beta sorts **older** than the official entry. HamBench will offer **Update** to the catalog version once the app change lands. Bump first when the bits differ from the published driver.

## Command

From the module repo (after `yarn install`), once `pack:beta` is merged:

```bash
yarn pack:beta <modelId> [n]
```

| Argument | Meaning |
| --- | --- |
| `modelId` | Config `id.model`, matching `configs/<modelId>.json`. Examples: `kenwood-th-d74`, `baofeng-uv5r`. |
| `n` | Optional beta counter, default `1`. A positive integer with no leading zero. Use `2`, `3`, … for another email at the same config version. |

Examples:

```bash
yarn pack:beta kenwood-th-d74
yarn pack:beta kenwood-th-d74 2
yarn pack:beta baofeng-uv5r
```

The command:

- Writes `dist-release/radio-module-<modelId>-<config.version>-beta.<n>.zip`. A config version `1.11.2` and `n` of `1` produces `radio-module-kenwood-th-d74-1.11.2-beta.1.zip`, and the config inside the zip has `"version": "1.11.2-beta.1"`.
- Includes that radio’s config and the `$ref` closure only (shared schemas and memory maps). Sibling configs stay out. It does not skip the radio because GitHub already has a release asset, and it does not call `gh`.
- Leaves the working tree unchanged. The `-beta.<n>` suffix is applied on a copy before zipping.
- Prints the zip path, size in bytes, a `sha256:` digest, and `git rev-parse --short HEAD` when git is available.
- Does not upload and does not write `catalog-entries.json`.
- Fails if the zip is larger than 1 MiB.

`yarn pack:release` deletes `radio-module-*.zip` files already in `dist-release/` before it writes. Copy the beta zip out of that directory before you run a release pack.

## What to send

1. Attach the zip. Current release zips are a few kilobytes to about 13 KB.
2. Paste the **`sha256:`** line from the command output so the tester can compare it in HamBench after the app change.
3. Tell them the model id and beta version (for example `1.11.2-beta.1`).
4. Point them to [Install a beta driver](/guide/beta-driver).

Do not publish this zip on GitHub Releases for catalog sync. Stable catalog entries stay `major.minor.patch` only ([ADR 0009](/developer/adr/0009-per-radio-modules)).

## After feedback

Merge the driver changes, bump versions as needed, and ship through [Publish a module](/developer/publishing-modules).
