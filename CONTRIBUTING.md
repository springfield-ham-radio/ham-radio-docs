# Contributing

[ham-radio-docs](https://github.com/springfield-ham-radio/ham-radio-docs) is the VitePress site for HamBench. The license file in the repo is the MIT License, Copyright (c) 2026 Bryan Hunt. See [LICENSE](LICENSE).

Listing a radio driver, the **Community** label, and the MIT or Apache-2.0 choice for that driver are [ADR 0012](docs/developer/adr/0012-community-drivers.md) and [Third-party and manufacturer drivers](docs/developer/third-party-drivers.md).

## Developer Certificate of Origin

Contributions require a [Developer Certificate of Origin](https://developercertificate.org/) `Signed-off-by` line. There is no contributor license agreement.

`git commit -s` adds the trailer. It must match the commit author:

```text
Signed-off-by: Your Name <you@example.com>
```

Each commit in the pull request carries its own line. That includes a pull request that changes this site and a pull request that lists a driver in [radio-module-catalog](https://github.com/springfield-ham-radio/radio-module-catalog).

## What this repository does today

Recent commits on `main` use [Conventional Commits](https://www.conventionalcommits.org/) (`docs`, `fix`, `ci`, `chore`). This package does not run commitlint. CI on pull requests is [`.github/workflows/ci.yml`](.github/workflows/ci.yml): Node from [`.nvmrc`](.nvmrc), `yarn install --immutable`, `yarn build`.

`yarn build` checks the generated [radio config reference](docs/developer/config-reference.md) against the vendored schemas in `scripts/vendor/`, then runs VitePress. VitePress fails the build on a dead internal link. [Documentation standards](docs/developer/documentation.md) say where a new page belongs.

Local preview:

```bash
yarn install
yarn dev
```

The dev server uses base path `/ham-radio-docs/`.

Pages that send a manufacturer through writing a driver:

- [For radio manufacturers](docs/developer/for-manufacturers.md)
- [Build a radio driver](docs/developer/build-a-radio-driver.md)
- [Radio config reference](docs/developer/config-reference.md)
- [Test a radio driver](docs/developer/testing-a-radio-driver.md)
- [Publish a module](docs/developer/publishing-modules.md)

`scripts/vendor/` holds `radio-protocol-schema.json` and `radio-memory-map-schema.json` from `@springfield/ham-radio-utils`, pinned in `scripts/vendor/SOURCE.json`. After you replace those files, run:

```bash
node scripts/render-config-reference.mjs --write
```
