# Install a beta driver

A **beta driver** is a single-radio zip a module author built with `yarn pack:beta` and sent you (email, chat, or USB). It is not in the official catalog. Official installs stay on [Install radios](/guide/install-radios). Authors build the zip with [Build a beta driver](/developer/beta-driver). The contract is [ADR 0010](/developer/adr/0010-local-beta-driver-zips).

You need the zip (for example `radio-module-kenwood-th-d74-1.11.2-beta.1.zip`) and the `sha256:` line from the author.

## Install

1. Open **Preferences → Drivers**.
2. Click **Install from file…** and choose the beta zip.
3. Read **Install beta driver?**. It says beta drivers are not published on the official catalog, shows the file path, the version parsed from the file name, and `sha256:` of the file. Confirm that digest matches the one the author sent.
4. Click **Install beta**.

If `minApiVersion` in the zip is newer than this HamBench, install stops and the new files are removed. Update HamBench and try again.

The installed row shows a **Beta** badge. The version line looks like `v1.11.2-beta.1 · kenwood-th-d74`. On the list of catalog drivers, that model shows **Beta installed**.

## While the beta is installed

Nothing replaces a beta in the background. HamBench orders versions as `1.11.1-beta.1` < `1.11.1` < `1.11.2-beta.1`. The number after `-beta.` compares as a number, so beta 2 is older than beta 10.

- When the official catalog version is **newer** than the beta (catalog `1.11.1`, beta `1.11.1-beta.1`, or catalog `1.11.2`, beta `1.11.1-beta.1`) and this app can run that catalog entry, **Update** installs the official driver, deletes the beta directory, and the badge becomes **Official**.
- When the beta is **newer** than the catalog (beta `1.11.2-beta.1`, catalog `1.11.1`), there is no **Update**. **Replace with official vX.Y.Z** is the way back. The confirm names both versions and says the beta files will be removed.
- **Switch to verified** and **Switch all to verified** apply to other local files, not to a beta row.
- **Remove** deletes that radio's beta directory. Other installed radios stay.

## Other local files

**Install from file…** still accepts zips that are not `x.y.z-beta.n` and single JSON configs. Those use **Install unverified module?** / **Install anyway**, and the row stays **Unverified**. The catalog list calls that row **Local file installed**.
