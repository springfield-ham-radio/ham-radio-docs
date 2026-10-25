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
      { text: 'Manufacturers', link: '/developer/for-manufacturers' },
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
            { text: 'Install a beta driver', link: '/guide/beta-driver' },
            { text: 'Read and write memory', link: '/guide/radio' },
            { text: 'Live CAT', link: '/guide/cat' },
            { text: 'Station log', link: '/guide/log' },
            { text: 'Channel library', link: '/guide/channels' },
            { text: 'Stations & antennas', link: '/guide/antennas' },
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
            { text: 'For radio manufacturers', link: '/developer/for-manufacturers' },
            { text: 'Architecture overview', link: '/developer/architecture-overview' },
            { text: 'Architecture reference', link: '/developer/architecture' },
            { text: 'Development guide', link: '/developer/development-guide' },
            { text: 'Architecture decisions', link: '/developer/adr/' }
          ]
        },
        {
          text: 'Radio modules',
          items: [
            { text: 'Build a radio driver', link: '/developer/build-a-radio-driver' },
            { text: 'Module layout', link: '/developer/radio-module-dev' },
            { text: 'Driver editor', link: '/developer/driver-editor' },
            { text: 'Config reference', link: '/developer/config-reference' },
            { text: 'Test a driver', link: '/developer/testing-a-radio-driver' },
            { text: 'Publish a module', link: '/developer/publishing-modules' },
            { text: 'Build a beta driver', link: '/developer/beta-driver' },
            { text: 'Third-party drivers (draft)', link: '/developer/third-party-drivers' }
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
