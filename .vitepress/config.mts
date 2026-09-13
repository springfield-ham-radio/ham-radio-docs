import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(defineConfig({
  srcDir: "docs",
  base: "/ham-radio-docs/",

  title: "HamBench",
  description: "Documentation for HamBench",

  appearance: true,

  themeConfig: {
    nav: [
      { text: 'User Guide', link: '/guide/' },
      { text: 'Developer', link: '/developer/' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'User Guide',
          items: [
            { text: 'Overview', link: '/guide/' },
            { text: 'Install HamBench', link: '/guide/getting-started' },
            { text: 'Install radios', link: '/guide/install-radios' },
            { text: 'Read and write memory', link: '/guide/radio' },
            { text: 'Live CAT', link: '/guide/cat' },
            { text: 'Channel library', link: '/guide/channels' },
            { text: 'Sniffer', link: '/guide/sniffer' },
            { text: 'License privileges', link: '/guide/license' }
          ]
        }
      ],
      '/developer/': [
        {
          text: 'Start here',
          items: [
            { text: 'Overview', link: '/developer/' },
            { text: 'Architecture overview', link: '/developer/architecture-overview' },
            { text: 'Architecture reference', link: '/developer/architecture' },
            { text: 'Modules', link: '/developer/module-comparison' },
            { text: 'Development guide', link: '/developer/development-guide' }
          ]
        },
        {
          text: 'Radio modules',
          items: [
            { text: 'Create a module', link: '/developer/radio-module-dev' },
            { text: 'Configuration format', link: '/developer/configuration' },
            { text: 'Publish a module', link: '/developer/publishing-modules' }
          ]
        },
        {
          text: 'Protocols',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/developer/protocols/' },
            { text: 'Protocol DSL', link: '/developer/protocols/dsl' },
            { text: 'Memory-map DSL', link: '/developer/protocols/memory-map' }
          ]
        },
        {
          text: 'Registry',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/developer/registry/' },
            { text: 'Why a registry?', link: '/developer/registry/why-registry' },
            { text: 'Architecture', link: '/developer/registry/architecture' },
            { text: 'Getting started', link: '/developer/registry/getting-started' },
            { text: 'Plugin development', link: '/developer/registry/plugin-development' },
            { text: 'API reference', link: '/developer/registry/api-reference' },
            { text: 'Examples', link: '/developer/registry/examples' }
          ]
        },
        {
          text: 'More',
          items: [
            { text: 'License lookup API', link: '/developer/license-lookup' },
            { text: 'Documentation standards', link: '/developer/documentation' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/springfield-ham-radio' }
    ]
  }
}))
