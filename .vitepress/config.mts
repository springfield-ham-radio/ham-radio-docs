import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// https://vitepress.dev/reference/site-config
export default withMermaid(defineConfig({
  srcDir: "docs",

  title: "Springfield Ham Radio",
  description: "Documentation for Springfield Ham Radio software ecosystem",

  // Appearance configuration for VitePress 2
  appearance: true,

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Getting Started', link: '/overview' },
      { text: 'Developer Guide', link: '/reference/' }
    ],

    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Overview', link: '/overview' },
            { text: 'Quick Start Guide', link: '/getting-started' },
            { text: 'Architecture Overview', link: '/architecture-overview' }
          ]
        }
      ],
      '/getting-started': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Overview', link: '/overview' },
            { text: 'Quick Start Guide', link: '/getting-started' },
            { text: 'Architecture Overview', link: '/architecture-overview' }
          ]
        }
      ],
      '/reference/': [
        {
          text: 'Developer Documentation',
          link: '/reference/developer-docs',
        },
        {
          text: 'Radio Module Development',
          link: '/reference/radio-module-dev',
        },
        {
          text: 'Architecture & Standards',
          items: [
            {
              text: 'Architecture Reference',
              link: '/reference/architecture',
              items: [
                { text: 'Registry Architecture', link: '/reference/registry/architecture' },
                { text: 'Why Registry?', link: '/reference/registry/why-registry' },
                { text: 'Plugin Development', link: '/reference/registry/plugin-development' },
                { text: 'Registry Examples', link: '/reference/registry/examples' },
                { text: 'Registry API Reference', link: '/reference/registry/api-reference' },
                { text: 'Registry Getting Started', link: '/reference/registry/getting-started' },
                { text: 'Protocols Overview', link: '/reference/protocols/' },
                { text: 'Protocol DSL', link: '/reference/protocols/dsl' }
              ]
            },
            { text: 'Module Comparison', link: '/reference/module-comparison' },
            { text: 'Documentation Standards', link: '/reference/documentation-guide' }
          ]
        },
        {
          text: 'Registry System',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/reference/registry/' },
            { text: 'Why Registry?', link: '/reference/registry/why-registry' },
            { text: 'Architecture', link: '/reference/registry/architecture' },
            { text: 'Getting Started', link: '/reference/registry/getting-started' },
            { text: 'Plugin Development', link: '/reference/registry/plugin-development' },
            { text: 'API Reference', link: '/reference/registry/api-reference' },
            { text: 'Examples', link: '/reference/registry/examples' },
            { text: 'Configuration', link: '/reference/registry/configuration' }
          ]
        },
        {
          text: 'Protocols & DSL',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/reference/protocols/' },
            { text: 'Protocol DSL', link: '/reference/protocols/dsl' }
          ]
        },
        {
          text: 'Configuration Format',
          link: '/reference/configuration/overview'
        }
      ],
      '/configuration/': [
        {
          text: 'Configuration',
          items: [
            { text: 'Overview', link: '/configuration/overview' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/springfield-ham-radio' }
    ]
  }
}))
