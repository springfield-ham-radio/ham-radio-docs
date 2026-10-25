# For radio manufacturers

A HamBench radio driver is a **radio module**: JSON that describes one radio's serial protocol, channel layout, and settings. HamBench already includes the driver that runs that JSON. You do not ship TypeScript, a codec, or an npm plugin.

Create your repository from [radio-module-template](https://github.com/springfield-ham-radio/radio-module-template). On that page, choose **Use this template**.

The worked example throughout these pages is the shipping Baofeng UV-5R module, [`configs/baofeng-uv5r.json`](https://github.com/springfield-ham-radio/radio-module-baofeng/blob/main/configs/baofeng-uv5r.json) in [radio-module-baofeng](https://github.com/springfield-ham-radio/radio-module-baofeng). UV-5R and UV-5RE Plus share that one file. Read it to see a finished driver, and put your radio's JSON in the repository you created from the template.

## Build one

1. [Build a radio driver](/developer/build-a-radio-driver) — capture traffic, draft in the app, write the protocol and memory map, test, pack a zip, install it, publish it.
2. [Radio config reference](/developer/config-reference) — every config field, including `minApiVersion`.
3. [Test a radio driver](/developer/testing-a-radio-driver) — fixtures, unit tests, and a hardware checklist (read, write, restore).
4. [Publish a module](/developer/publishing-modules) — one zip per radio, catalog schema version 3.
5. [Protocol DSL](/developer/protocols/dsl) and [Memory-map DSL](/developer/protocols/memory-map) — the two JSON languages the generic driver runs.

To hand a tester one radio before you publish, use [Build a beta driver](/developer/beta-driver) (`yarn pack:beta`). Testers follow [Install a beta driver](/guide/beta-driver). A beta zip is not a catalog entry.

An outside repository is listed from a pull request on the catalog. The rules are [Third-party and manufacturer drivers](/developer/third-party-drivers) ([ADR 0012](/developer/adr/0012-community-drivers)). Commits need a DCO `Signed-off-by` line ([CONTRIBUTING](https://github.com/springfield-ham-radio/ham-radio-docs/blob/main/CONTRIBUTING.md)). There is no CLA. You do not have to publish confidential specifications. The driver you list has to be publishable under MIT or Apache-2.0.
