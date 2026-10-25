# Third-party and manufacturer drivers

**Proposed, pending maintainer decision.** This page is not a policy. The first section is what the repositories and the app do today. The second section is unanswered. Do not treat an open question as a rule you can follow.

## What is true today

- A radio module is JSON: `configs/*.json`, schemas, and memory maps. HamBench does not run code from the zip ([ADR 0004](/developer/adr/0004-radio-modules-json-only)).
- The official index is [radio-module-catalog](https://github.com/springfield-ham-radio/radio-module-catalog) `catalog.json`, schema version 3. Each entry is one radio zip on a GitHub Release ([Publish a module](/developer/publishing-modules), [ADR 0009](/developer/adr/0009-per-radio-modules)).
- The entries on `main` today are the Springfield manufacturer repos already listed there: Baofeng UV-5R, Kenwood TH-F6, TH-D74, and TM-D710A. The sync job updates those entries from the GitHub repo encoded in each `downloadUrl`. It does not discover new repositories.
- Official install checks `minApiVersion` and the catalog `integrity` string, then extracts JSON. The local catalog row is source `installed`.
- **Preferences → Drivers → Install from file…** installs a zip or a config JSON as source `user`. The app labels that row **Unverified**. It does not update the row from the catalog. The dialog warns that this is at your own risk ([Install radios](/guide/install-radios)).
- [ADR 0007](/developer/adr/0007-mit-license-no-chirp-code) applies to source and fixtures committed in these repositories: MIT, no copied CHIRP code, fixtures from rights-clear captures.

[ADR 0004](/developer/adr/0004-radio-modules-json-only) says official and third-party radio support is packaged as that JSON. It does not say how a repository outside the current catalog becomes an official entry, and it does not define a review.

## Open questions

These need a maintainer decision. This page does not answer them.

1. **Listing an outside repository.** Can a GitHub repo that springfield-ham-radio does not own be added to `catalog.json`? Who opens that pull request, and who merges it? The sync job only refreshes entries that are already in the file.
2. **Review criteria.** If an outside module can be listed, what must a reviewer check? Candidates a reviewer would have to choose among, not a checklist that is in force: protocol and memory map validated against the utils schemas, `minApiVersion` set, one config per zip, hardware notes, fixture provenance under [ADR 0007](/developer/adr/0007-mit-license-no-chirp-code), and no executable files in the zip. None of these are adopted here as acceptance rules.
3. **Official and Unverified.** Today **Unverified** means a local file install (source `user`), and a catalog install is the official path. It is not decided whether a reviewed third-party catalog entry would look like today's official rows, stay **Unverified**, or use some other label. It is not decided whether "official" means "in the catalog" or "published by springfield-ham-radio".
4. **Who ships updates.** It is not decided who keeps an outside entry's `downloadUrl`, tag, and integrity current if the author stops publishing, or whether the sync job is allowed to follow a fork.
5. **License and contributor agreements.** It is not decided whether a module in the catalog must be MIT, or whether authors sign a CLA or use a DCO. The same question is open for this docs repo in [CONTRIBUTING.md](https://github.com/springfield-ham-radio/ham-radio-docs/blob/main/CONTRIBUTING.md). [ADR 0007](/developer/adr/0007-mit-license-no-chirp-code) states the license of the org repositories as they are now. It does not set a contribution agreement.

Until those are decided, a radio you built with [Build a radio driver](/developer/build-a-radio-driver) can be installed from the zip on your own machine. That install is **Unverified**. Putting the zip on the public catalog is not a step this page can authorize.
