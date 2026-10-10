# ADR 0007: MIT license and no copied CHIRP code

- **Status:** Accepted
- **Date:** 2026-10-10

## Context

The springfield-ham-radio org ships HamBench and libraries under the MIT License (Copyright (c) 2026 Bryan Hunt). CHIRP is GPL-2. Contributors routinely read CHIRP drivers and memory formats to understand radios, especially when Springfield hardware verification is not yet done ([ham-radio-ui#60](https://github.com/springfield-ham-radio/ham-radio-ui/issues/60)).

[Memory-Map DSL](/developer/protocols/memory-map) already states not to copy CHIRP source. There was no org-wide ADR for license boundaries or test fixture provenance.

## Decision

**License.** Project source in the org is MIT unless a file explicitly states otherwise. Do not paste or adapt CHIRP (or other GPL) source into MIT repositories.

**Understanding vs copying.** Read CHIRP (and vendor docs) to learn protocol and layout. Re-express layouts, enumerations, and protocol steps as JSON in memory maps and Protocol DSL configs.

**Test fixtures.** Binary or image fixtures used in codec and protocol tests must come from Bryan’s own radio dumps or other rights-clear captures by project contributors—not from CHIRP’s distributed GPL images or other GPL fixture bundles. This rule is policy from this ADR forward; repositories are not required to run an automated provenance checker yet.

**Issue tracking.** Protocol details taken from CHIRP without on-air verification must be labeled as unverified in issues (as in #60) until sniffer or hardware confirms them.

## Options considered

**Vendor or translate CHIRP drivers into the tree.** Rejected. License incompatibility and maintenance cost.

**License HamBench as GPL-2.** Rejected. Libraries and modules are intended to stay MIT for broad reuse.

**MIT code, JSON layouts, own fixtures, CHIRP as read-only reference.** Accepted.

## Consequences

- New module PRs should describe fixture origin when adding binary test data.
- Icom and other CHIRP-derived proposals ship only after independent verification or clearly marked caveats.
- Documentation continues to credit CHIRP as a reference tool without importing its code.
