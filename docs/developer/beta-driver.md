# Build a beta driver

Use this when a tester should try one radio's driver in HamBench before you publish a GitHub Release or change the official catalog. The contract is [ADR 0010](/developer/adr/0010-local-beta-driver-zips). Send testers to [Install a beta driver](/guide/beta-driver).

This is not the manufacturer repo `beta` branch release ([ADR 0008](/developer/adr/0008-versioning-and-releases)). Do not attach the zip to a Release, and do not run semantic-release for a handoff. Stable catalog entries stay `major.minor.patch` only ([ADR 0009](/developer/adr/0009-per-radio-modules)).

`yarn pack:beta` is in [`radio-module-kenwood`](https://github.com/springfield-ham-radio/radio-module-kenwood) and [`radio-module-baofeng`](https://github.com/springfield-ham-radio/radio-module-baofeng). Both `package.json` scripts run `node scripts/pack-beta-zip.mjs`.

A shared `ham-radio-pack-beta` command is in draft pull request [ham-radio-utils#35](https://github.com/springfield-ham-radio/ham-radio-utils/pull/35), expected in `@springfield/ham-radio-utils` 4.17.0. Until those repos point `pack:beta` at that bin, `yarn pack:beta` is the local script.

## Before you pack

1. Work in the Kenwood or Baofeng module repo. The worked example in [Build a radio driver](/developer/build-a-radio-driver) is `baofeng-uv5r`.
2. Bump `configs/<modelId>.json` `version` when you change that config or any file its `$ref`s reach ([ADR 0006](/developer/adr/0006-per-driver-config-semver)). `pack:beta` does not bump for you.
3. Keep working-tree `version` and `minApiVersion` as strict `x.y.z` (`major.minor.patch`). The command rejects a prerelease or build metadata (`-beta`, `+sha`) already written in the file. Kenwood `pack:release` still accepts any non-empty `minApiVersion`; `pack:beta` does not.

HamBench orders versions as `1.11.1-beta.1` < `1.11.1` < `1.11.2-beta.1`. Beta counters compare as numbers (`2` < `10`). A beta packed from the same `x.y.z` as the catalog entry is older than that entry, so HamBench offers **Update** to the official driver. Bump `version` first when the bits differ from the published driver.

## Command

From the module repo, after `yarn install`:

```bash
yarn pack:beta <modelId> [n]
```

| Argument | Meaning |
| --- | --- |
| `modelId` | Config `id.model`, matching `configs/<modelId>.json`. Examples: `kenwood-th-d74`, `baofeng-uv5r`. |
| `n` | Optional beta counter, default `1`. A positive integer with no leading zero. Use `2`, `3`, … for another zip at the same config version. |

```bash
yarn pack:beta kenwood-th-d74
yarn pack:beta kenwood-th-d74 2
yarn pack:beta baofeng-uv5r
```

The command:

- Writes `dist-release/radio-module-<modelId>-<version>-beta.<n>.zip`. Config version `1.11.2` and `n` of `1` produces `radio-module-kenwood-th-d74-1.11.2-beta.1.zip`. The config inside the zip has `"version": "1.11.2-beta.1"`. The working tree is not modified. The suffix is applied on a copy before zipping.
- Includes that radio's config and the `$ref` closure only (shared schemas and memory maps). Sibling configs stay out. It does not skip a radio because GitHub already has a release asset, and it does not call `gh`.
- Leaves other zips in `dist-release/` in place. It does not write `catalog-entries.json` and does not upload.
- Prints four lines on stdout when git can name the commit: zip path, size in bytes, `sha256:` plus the digest, and `git rev-parse --short HEAD`. The git line is omitted when that command fails.
- Fails, and deletes the zip it just wrote, if the zip is larger than 1 MiB (1048576 bytes).

`yarn pack:release` deletes `radio-module-*.zip` files already in `dist-release/` before it writes. Copy the beta zip out of that directory before you run a release pack.

## What to send

1. Attach the zip.
2. Paste the `sha256:` line. HamBench shows that digest in **Install beta driver?** so the tester can compare it.
3. Tell them the model id and the packed version (`1.11.2-beta.1`).
4. Point them to [Install a beta driver](/guide/beta-driver).

## After feedback

Merge the driver changes, bump `version` to the release `x.y.z`, and ship through [Publish a module](/developer/publishing-modules).
