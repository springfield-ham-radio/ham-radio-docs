# ADR 0008: Versioning and releases

- **Status:** Accepted
- **Date:** 2026-10-10

## Context

About a dozen repositories share libraries, the desktop app, radio modules, and docs. Hand-edited versions and changelogs diverge quickly. Branch protection on `main` blocks pushes from the default `GITHUB_TOKEN` during semantic-release.

Org practice is documented in [ham-radio-ops semantic-release and conventional-commits rules](https://github.com/springfield-ham-radio/ham-radio-ops/tree/main/.cursor/rules) and implemented in per-repo CI.

## Decision

**Versions from commits.** [semantic-release](https://semantic-release.gitbook.io/) sets package (and related artifact) versions from [Conventional Commits](https://www.conventionalcommits.org/). Do not hand-edit `package.json` `version` or `CHANGELOG.md` on release branches. commitlint uses `@commitlint/config-conventional` in repos that release.

**Release branches.** `main` produces stable releases. The `beta` branch produces prereleases (`prerelease: true` in semantic-release `branches`). As of 2026-10-10, `main` + `beta` are configured in: ham-radio-api, ham-radio-utils, ham-radio-driver, ham-radio-registry, ham-radio-ui, radio-module-baofeng, and radio-module-kenwood (`release.branches` in each `package.json`). ham-radio-ui documents beta behavior in [`docs/releasing.md`](https://github.com/springfield-ham-radio/ham-radio-ui/blob/main/docs/releasing.md).

**GitHub App token.** Release jobs mint a token with `actions/create-github-app-token` using `RELEASE_APP_ID` and `RELEASE_APP_PRIVATE_KEY` so the GitHub App **springfield-ham-radio-release** can push release commits and tags past branch protection. semantic-release and asset upload steps use that token as `GITHUB_TOKEN` / `GH_TOKEN`. See merged `ci: release via GitHub App token` PRs (for example ham-radio-ui #53, ham-radio-api #15, radio-module-baofeng #17).

**Scope.** This ADR covers org release mechanics. Library layering and npm publication of `@springfield/*` packages are documented elsewhere; radio modules use the same release tooling but publish zips, not npm ([ADR 0005](./0005-module-distribution-github-catalog.md)).

**Stale ops notes.** Some ham-radio-ops cursor rules still mention GitLab CI; those are corrected in a separate ham-radio-ops change, not in this docs PR.

## Options considered

**Manual version bumps and changelogs.** Rejected.

**semantic-release with default `GITHUB_TOKEN` only.** Rejected once `main` requires pull requests; the app bypass is required.

**semantic-release + Conventional Commits + springfield-ham-radio-release.** Accepted.

## Consequences

- Contributors use conventional commit types (`feat`, `fix`, `docs`, `ci`, etc.) so releases stay predictable.
- Beta consumers install prerelease builds from the `beta` branch workflow where published.
- New releasable repos copy the same `release` job pattern and org secrets.
- ham-radio-docs is not published to npm (`private: true` in `package.json`) and is not on semantic-release; versioned ADRs use acceptance dates instead.
