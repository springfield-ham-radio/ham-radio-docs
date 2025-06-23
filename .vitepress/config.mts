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
      { text: 'Home', link: '/' },
      { text: 'Overview', link: '/overview' },
      { text: 'Architecture', link: '/architecture' },
      { text: 'Development', link: '/development-guide' },
      { text: 'Registry', link: '/registry/' },
      { text: 'Protocols', link: '/protocols/' }
    ],

    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Documentation Guide', link: '/documentation-guide' },
            { text: 'Overview', link: '/overview' },
            { text: 'Architecture', link: '/architecture' },
            { text: 'Module Comparison', link: '/module-comparison' },
            { text: 'Development Guide', link: '/development-guide' }
          ]
        }
      ],
      '/registry/': [
        {
          text: 'Ham Radio Registry',
          items: [
            { text: 'Overview', link: '/registry/' },
            { text: 'Why Registry?', link: '/registry/why-registry' },
            { text: 'Architecture', link: '/registry/architecture' },
            { text: 'Getting Started', link: '/registry/getting-started' },
            { text: 'Plugin Development', link: '/registry/plugin-development' },
            { text: 'API Reference', link: '/registry/api-reference' },
            { text: 'Examples', link: '/registry/examples' }
          ]
        }
      ],
      '/protocols/': [
        {
          text: 'Protocols & DSL',
          items: [
            { text: 'Overview', link: '/protocols/' },
            { text: 'Protocol DSL', link: '/protocols/dsl' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/springfield-ham-radio' }
    ]
  }
}))
