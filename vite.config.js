import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    rollupOptions: {
      input: {
        pajglanje: 'index.html',
        brzalica: 'brzalica.html',
        tragalica: 'tragalica.html',
        maintenance: 'maintenance.html'
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  }
})