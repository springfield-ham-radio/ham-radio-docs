# Third-party and manufacturer drivers

Accepted in [ADR 0012](/developer/adr/0012-community-drivers). Springfield radios stay on [Publish a module](/developer/publishing-modules). A new repository starts from [radio-module-template](https://github.com/springfield-ham-radio/radio-module-template) (**Use this template**). The walkthrough is [Build a radio driver](/developer/build-a-radio-driver).

## Listing

The author keeps the driver in their own Git repository. To list it, they open a pull request on [radio-module-catalog](https://github.com/springfield-ham-radio/radio-module-catalog). Bryan Hunt approves that pull request.

The entry is pinned to one release asset and the SHA-256 of that zip. Shipping a newer zip does not move the catalog entry. The author opens another pull request, and that pull request is reviewed the same way.

Springfield modules already in the catalog still follow the hourly sync. That sync is not how an outside repository is added.

## Review

The catalog pull request shows all of the following:

- Schema checks and CI pass. The config and memory map validate with `SchemaValidator` in `@springfield/ham-radio-utils` ([Radio config reference](/developer/config-reference)).
- Tests are from the author's own radio dumps. The driver contains no CHIRP code ([ADR 0007](/developer/adr/0007-mit-license-no-chirp-code.md), [Test a radio driver](/developer/testing-a-radio-driver)).
- A hardware test report: read, write, and restore on a real radio. The checklist on the testing page is the coverage that report needs.
- A named maintainer.
- An allowed license: MIT or Apache-2.0.

## Labels

| What the user has | Label |
| --- | --- |
| Published by springfield-ham-radio | **Official** |
| Reviewed driver from another publisher | **Community, by &lt;publisher&gt;** |
| Zip or JSON installed from a file | **Unverified** |

**Official** means published by springfield-ham-radio. A reviewed outside driver is not Official.

HamBench and the catalog schema do not store the **Community** label yet. That is follow-up work ([ADR 0012](/developer/adr/0012-community-drivers)). Until it ships, a catalog install still shows **Official** in the app. A file install already shows **Unverified** ([Install radios](/guide/install-radios)). A beta file install shows **Beta** ([Install a beta driver](/guide/beta-driver)).

## Upkeep

The author maintains the driver. If it breaks with a new API version, or nobody responds for about 90 days, the entry is marked **Deprecated** and removed later. The catalog schema has no Deprecated value yet; the same follow-up that adds **Community** is where that mark will live. Because the driver is MIT or Apache-2.0, the project may take it over.

## Licensing

A listed driver may be MIT or Apache-2.0.

Contributions require a `Signed-off-by` line under the [Developer Certificate of Origin](https://developercertificate.org/). There is no CLA. See [CONTRIBUTING.md](https://github.com/springfield-ham-radio/ham-radio-docs/blob/main/CONTRIBUTING.md) for the line itself.

Manufacturers do not have to publish confidential specifications. The driver that is listed has to be publishable under MIT or Apache-2.0.
