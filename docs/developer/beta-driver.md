# Build a beta driver

Use this when you want a tester to try one radio’s driver in HamBench **before** you publish a GitHub Release or change the official catalog. See [ADR 0010](/developer/adr/0010-local-beta-driver-zips) for the contract; [Install a beta driver](/guide/beta-driver) is what you send them.

This is not the manufacturer repo `beta` branch release ([ADR 0008](/developer/adr/0008-versioning-and-releases.md)). Do not attach the zip to a Release or run semantic-release for a handoff.

## Before you pack

1. Work in [`radio-module-kenwood`](https://github.com/springfield-ham-radio/radio-module-kenwood) or [`radio-module-baofeng`](https://github.com/springfield-ham-radio/radio-module-baofeng).
2. Bump the target `configs/<modelId>.json` `version` when you change that config or any file its `$ref`s reach ([ADR 0006](/developer/adr/0006-per-driver-config-semver.md)). `pack:beta` does not bump for you.
3. Keep `minApiVersion` as strict `major.minor.patch`. If the beta needs a newer HamBench API than the tester’s app, they must update HamBench first; the app blocks install otherwise ([ADR 0010](/developer/adr/0010-local-beta-driver-zips)).

If you pack without bumping and the config version already matches the catalog, the beta sorts **older** than the official entry. HamBench will offer **Update** to the catalog version. That is correct; bump first when you are testing new bits.

## Command

From the module repo (after `yarn install`):

```bash
yarn pack:beta <modelId> [n]
```

| Argument | Meaning |
| --- | --- |
| `modelId` | Config `id.model`, for example `kenwood-th-d74` or `baofeng-uv5r`. |
| `n` | Optional beta counter, default `1`. Use `2`, `3`, … for another email at the same config version. |

Examples:

```bash
yarn pack:beta kenwood-th-d74
yarn pack:beta kenwood-th-d74 2
yarn pack:beta baofeng-uv5r
```

The command:

- Builds `dist-release/radio-module-<modelId>-<version>-beta.<n>.zip` with that radio’s config and its `$ref` closure only (same rules as `pack:release` for one model).
- Leaves your working tree unchanged (the `-beta.<n>` suffix exists only inside the zip).
- Prints the zip path, size in bytes, `sha256:` digest, and the short git commit when git is available.
- Does not upload, does not write catalog JSON, and does not call GitHub.
- Fails if the zip is larger than 1 MiB (treat that as a bad closure, not something to email).

## What to send

1. Attach the zip (typical per-radio zips are a few kilobytes).
2. Paste the **`sha256:`** line from the command output so the tester can compare it in HamBench.
3. Tell them which `modelId` and beta version you built (for example `1.11.2-beta.1`).
4. Point them to [Install a beta driver](/guide/beta-driver).

Do not publish this zip on GitHub Releases for catalog sync; stable catalog entries stay `major.minor.patch` only ([ADR 0009](/developer/adr/0009-per-radio-modules.md)).

## After feedback

Merge your driver changes, bump version as needed, and ship through the normal path: [Publish a module](/developer/publishing-modules).
