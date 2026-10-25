# For radio manufacturers

A HamBench radio driver is a **radio module**: JSON that describes one radio's serial protocol, channel layout, and settings. HamBench already includes the driver that runs that JSON. You do not ship TypeScript, a codec, or an npm plugin.

The worked example throughout these pages is the shipping Baofeng UV-5R module, [`configs/baofeng-uv5r.json`](https://github.com/springfield-ham-radio/radio-module-baofeng/blob/main/configs/baofeng-uv5r.json) in [radio-module-baofeng](https://github.com/springfield-ham-radio/radio-module-baofeng). UV-5R and UV-5RE Plus share that one file. Use it as the shape to copy, then replace the bytes and the map with the radio you are bringing up.

## Build one

1. [Build a radio driver](/developer/build-a-radio-driver) — capture traffic, draft in the app, write the protocol and memory map, test, pack a zip, install it, publish it.
2. [Radio config reference](/developer/config-reference) — every config field, including `minApiVersion`.
3. [Test a radio driver](/developer/testing-a-radio-driver) — fixtures, unit tests, and a hardware checklist (read, write, restore).
4. [Publish a module](/developer/publishing-modules) — one zip per radio, catalog schema version 3.
5. [Protocol DSL](/developer/protocols/dsl) and [Memory-map DSL](/developer/protocols/memory-map) — the two JSON languages the generic driver runs.

To hand a tester one radio before you publish, use [Build a beta driver](/developer/beta-driver) (`yarn pack:beta`). Testers follow [Install a beta driver](/guide/beta-driver). A beta zip is not a catalog entry.

[Third-party and manufacturer drivers](/developer/third-party-drivers) is a draft. It describes what the app does today and lists decisions that are not made yet. [Contributing](https://github.com/springfield-ham-radio/ham-radio-docs/blob/main/CONTRIBUTING.md) is the same kind of draft for this docs repository.
