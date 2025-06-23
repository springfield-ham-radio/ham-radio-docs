---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Springfield Ham Radio"
  text: "Software ecosystem for amateur radio"
  tagline: Discover, configure, and manage radio modules with ease
  actions:
    - theme: brand
      text: Registry Documentation
      link: /registry/
    - theme: alt
      text: View on GitHub
      link: https://github.com/springfield-ham-radio

features:
  - title: Radio Module Registry
    details: Discover and manage radio configurations from npm modules. Support for both official and third-party radio modules with automatic discovery and validation.
  - title: Plugin Architecture
    details: Extensible plugin system that allows third-party developers to create and distribute radio configurations. Standardized module structure with shared components.
  - title: Codec Support
    details: Flexible codec system with factory pattern support. Share codecs across related radio models and implement custom encoding/decoding logic.
  - title: Security First
    details: Built-in security validation, sandboxed codec execution, and tamper detection to ensure safe loading of third-party modules.
---
