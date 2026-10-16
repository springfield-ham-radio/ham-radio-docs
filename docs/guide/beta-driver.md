# Install a beta driver

A **beta driver** is a single-radio zip a module author built on their machine and sent you (email, chat, USB). It is **not** in the official catalog. HamBench does not have a catalog integrity hash for it; you compare a SHA-256 digest instead. See [ADR 0010](/developer/adr/0010-local-beta-driver-zips).

Official installs are unchanged: [Install radios](/guide/install-radios).

## What you need

- A HamBench build that supports beta installs (once the feature ships in ham-radio-ui).
- The zip file, for example `radio-module-kenwood-th-d74-1.11.2-beta.1.zip`.
- The `sha256:` value from the author’s `pack:beta` output (paste it into your notes so you can compare in the dialog).

## Install

1. Open **Preferences → Drivers**.
2. Click **Install from file…** and choose the beta zip.
3. Read the **Install beta driver?** dialog. It explains that Springfield did not publish this file and shows the file’s SHA-256. Confirm it matches what the author sent.
4. Click **Install beta**.

If install fails because the driver needs a newer HamBench than yours, update the app and try again. The beta is not left half-installed.

On success the radio appears with a **Beta** badge and a version like `v1.11.2-beta.1 · kenwood-th-d74`.

## While the beta is installed

- HamBench does not auto-update betas from the catalog in the background.
- If the **official catalog version is newer** than your beta (for example catalog `1.11.2` and beta `1.11.2-beta.1`), use **Update** to switch to the official driver. That removes the beta files and shows **Official**.
- If your beta is **newer** than the catalog (for example beta `1.11.2-beta.1` and catalog `1.11.1`), keep testing. You can use **Replace with official…** only when you explicitly want to go back to the catalog version; the app asks you to confirm both versions.
- **Remove** deletes only that radio’s beta install directory. Other radios you installed stay.

## Not a beta zip

**Install from file…** still accepts other local zips and single JSON configs. Those stay **Unverified** with the general at-your-own-risk warning, not the beta SHA-256 flow.
