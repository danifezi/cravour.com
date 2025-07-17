import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  // This makes the environment variable available in client-side code
  // as `process.env.API_KEY`. The hosting provider (e.g., Netlify) must
  // be configured to set `GEMINI_API_KEY`.
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.GEMINI_API_KEY)
  },
  build: {
    outDir: 'dist', 
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        features: resolve(__dirname, 'features.html'),
        pricing: resolve(__dirname, 'pricing.html'),
        testimonials: resolve(__dirname, 'testimonials.html'),
        signin: resolve(__dirname, 'signin.html'),
        success: resolve(__dirname, 'success.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
      }
    }
  },
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    }
  }
})