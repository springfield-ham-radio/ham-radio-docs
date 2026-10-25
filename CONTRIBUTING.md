# Contributing

**Proposed, pending maintainer decision.** The maintainer has not adopted this file as policy. The first section is how this repository behaves today. [Open questions](#open-questions) are not rules.

## What this repository does today

[ham-radio-docs](https://github.com/springfield-ham-radio/ham-radio-docs) is the VitePress site for HamBench. The license file in the repo is the MIT License, Copyright (c) 2026 Bryan Hunt. See [LICENSE](LICENSE).

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

## Open questions

1. **License of contributions.** The repository is MIT today. It is not decided whether a patch must be offered under that same license, or under some other term.
2. **CLA.** It is not decided whether contributors assign or license their work through a contributor license agreement.
3. **DCO.** It is not decided whether commits must carry a `Signed-off-by` line under the Developer Certificate of Origin.

[Third-party and manufacturer drivers](docs/developer/third-party-drivers.md) repeats the license question for radio modules. Neither page answers it.
