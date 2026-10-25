# ADR 0012: Community drivers

- **Status:** Accepted
- **Date:** 2026-10-25

## Context

[ADR 0004](./0004-radio-modules-json-only.md) says official and third-party radio support is the same JSON module. [ADR 0005](./0005-module-distribution-github-catalog.md) and [ADR 0009](./0009-per-radio-modules.md) put official radios in [radio-module-catalog](https://github.com/springfield-ham-radio/radio-module-catalog). The catalog on `main` lists Springfield manufacturer repos. Its hourly sync moves those entries to the newest stable zip. HamBench labels a catalog install **Official** and a file install **Unverified** (a `x.y.z-beta.n` file install is **Beta**, [ADR 0010](./0010-local-beta-driver-zips.md)).

There was no rule for listing a repository the org does not own, no review checklist, no name for that listing, no upkeep rule, and no choice between a CLA and a DCO. [ADR 0007](./0007-mit-license-no-chirp-code.md) already requires MIT for org repositories, no copied CHIRP code, and rights-clear fixtures.

## Decision

**Listing.** An outside author keeps the driver in their own repository. They open a pull request on `radio-module-catalog`. Bryan Hunt approves it. The entry is pinned to one GitHub Release and the SHA-256 of that zip. A later release is not listed until a new pull request is reviewed. Springfield modules already in the catalog stay on the sync workflow in [Publish a module](/developer/publishing-modules).

**Review.** A community driver is accepted when all of these are true:

- Schema checks and CI pass.
- Tests use the author's own radio dumps. The driver contains no CHIRP code ([ADR 0007](./0007-mit-license-no-chirp-code.md)).
- The pull request includes a hardware test report: read, write, and restore on a real radio.
- A maintainer is named.
- The license is one of the licenses below.

**Labels.** **Official** means published by springfield-ham-radio. A reviewed outside driver is shown as **Community, by &lt;publisher&gt;**. A zip or JSON file installed from disk stays **Unverified**.

**Upkeep.** The author maintains a community driver. If it breaks on a new API version, or nobody responds for about 90 days, it is marked **Deprecated** and removed later. The license allows the project to take the driver over.

**Licensing.** A listed driver may be MIT or Apache-2.0. Contributions require a `Signed-off-by` line under the [Developer Certificate of Origin](https://developercertificate.org/). There is no CLA. Manufacturers do not have to publish confidential specifications. The driver that is listed has to be publishable under the license above.

**Not in this record.** HamBench and the catalog schema do not yet store or display **Community** or **Deprecated**. That support is follow-up work. Until it lands, the app still shows a catalog install as **Official**.

## Consequences

- Author and operator text is [Third-party and manufacturer drivers](/developer/third-party-drivers). Docs contributions use [CONTRIBUTING.md](https://github.com/springfield-ham-radio/ham-radio-docs/blob/main/CONTRIBUTING.md).
- New modules start from [radio-module-template](https://github.com/springfield-ham-radio/radio-module-template) (**Use this template**).
- The hourly catalog sync updates every entry from the newest stable zip. A pinned community entry must be left unchanged by that job until a reviewed pull request. That skip is part of the catalog follow-up, together with the **Community** label.
- File installs stay **Unverified**. They are not community listings.
- [ADR 0007](./0007-mit-license-no-chirp-code.md) still forbids CHIRP code and GPL fixtures. This record adds Apache-2.0 as a second license for a listed driver, and it requires the DCO instead of a CLA.
