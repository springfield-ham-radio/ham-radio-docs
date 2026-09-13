# Documentation standards

HamBench docs are split in two:

- **[User Guide](/guide/)** — install the app, install radios, Import/Write, CAT, channel library, sniffer, license privileges
- **[Developer docs](/developer/)** — packages, protocol DSL, memory maps, radio modules, registry

Put operator-facing steps in the User Guide. Put JSON schemas, TypeScript APIs, and module authoring in Developer docs. Link across the two instead of duplicating.

Each concept should live in one place. When you change a protocol field or a UI flow, update that page in the same change.

## Principles

- No redundancy: one primary location, then cross-references
- Progressive disclosure: overview first, then specialized pages
- Examples should match shipping JSON and TypeScript

## Contributing

1. Check for existing content before adding a page
2. Link instead of copying
3. Keep the User Guide / Developer split
4. Run `yarn build` in `ham-radio-docs` so VitePress dead-link checks pass
