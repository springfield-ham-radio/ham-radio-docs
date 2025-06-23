import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// https://vitepress.dev/reference/site-config
export default withMermaid(defineConfig({
  srcDir: "docs",
  
  title: "Springfield Ham Radio",
  description: "Documentation for Springfield Ham Radio software ecosystem",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Registry', link: '/registry/' },
      { text: 'Protocols', link: '/protocols/' },
      { text: 'Examples', link: '/examples/' }
    ],

    sidebar: {
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
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Markdown Examples', link: '/examples/markdown-examples' },
            { text: 'Runtime API Examples', link: '/examples/api-examples' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/springfield-ham-radio' }
    ]
  }
}))
