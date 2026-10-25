import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import mermaid from 'mermaid'
import './style.css'

// The mermaid package registers a window "load" listener with startOnLoad
// true as soon as it is imported. That runs before Mermaid.vue applies the
// VitePress plugin config. Turn it off at theme load, which is still before
// the load event.
mermaid.startOnLoad = false
mermaid.initialize({
  startOnLoad: false,
  suppressErrorRendering: true,
  securityLevel: 'loose',
  layout: 'dagre',
})

export default {
  ...DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // Add any custom slots here if needed
    })
  },
  enhanceApp() {
    // Register any global components here if needed
  }
} 
