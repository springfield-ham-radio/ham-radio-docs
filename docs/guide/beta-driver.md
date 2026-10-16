# Install a beta driver

A **beta driver** is a single-radio zip a module author built on their machine and sent you (email, chat, or USB). It is not in the official catalog. Official installs stay on [Install radios](/guide/install-radios). The contract is [ADR 0010](/developer/adr/0010-local-beta-driver-zips).

**This flow is not in HamBench yet.** It lands in a later ham-radio-ui pull request. The buttons and badges below are that change, not the app you have today.

## What the app does today

**Preferences → Drivers → Install from file…** still installs any local zip as **Unverified**:

- The dialog title is **Install unverified module?** and the confirm button is **Install anyway**. It does not show a SHA-256.
- The install version is only `major.minor.patch` up to the first hyphen. `radio-module-kenwood-th-d74-1.11.2-beta.1.zip` is stored as version `1.11.2`, not `1.11.2-beta.1`.
- Local zips are not checked against `minApiVersion`.
- There is no **Update** on an unverified row. If that model is in the catalog and this HamBench is new enough, **Switch to verified** replaces it with the official zip without comparing a beta suffix.

Wait for the HamBench build that includes the beta install change before you treat an emailed zip as a beta.

## After that HamBench change

You need the zip (for example `radio-module-kenwood-th-d74-1.11.2-beta.1.zip`) and the `sha256:` line from the author’s `pack:beta` output. `pack:beta` itself is added in the manufacturer repos in separate pull requests; see [Build a beta driver](/developer/beta-driver).

1. Open **Preferences → Drivers**.
2. Click **Install from file…** and choose the beta zip.
3. Read **Install beta driver?**. It says this file is not in the official catalog, that HamBench has no catalog integrity hash for it, and it shows the file’s SHA-256. Confirm that digest matches the one the author sent.
4. Click **Install beta**.

If `minApiVersion` in the zip is newer than this HamBench, install stops and the new files are removed. Update HamBench and try again.

On success the row shows a **Beta** badge and a version like `v1.11.2-beta.1 · kenwood-th-d74`.

### While the beta is installed

- Nothing replaces a beta in the background.
- If the official catalog version is **newer** than the beta (catalog `1.11.2`, beta `1.11.2-beta.1`) and this app can run that catalog entry, **Update** switches to the official driver, deletes the beta directory, and the badge becomes **Official**.
- If the beta is **newer** than the catalog (beta `1.11.2-beta.1`, catalog `1.11.1`), there is no **Update** and no **Switch to verified** (including **Switch all to verified**). **Replace with official vX.Y.Z…** is the explicit way back; the confirm names both versions.
- **Remove** deletes that radio’s beta directory only. Other installed radios stay.

## Other local files

**Install from file…** still accepts zips that are not `major.minor.patch-beta.<n>` and single JSON configs. Those stay **Unverified**, with the at-your-own-risk dialog, including after the HamBench change.
