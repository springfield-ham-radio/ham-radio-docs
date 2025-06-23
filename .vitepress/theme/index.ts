import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import './style.css'

export default {
  ...DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // Add any custom slots here if needed
    })
  },
  enhanceApp({ app }) {
    // Register any global components here if needed
  }
} 
