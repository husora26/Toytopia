import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `vite build --mode single` baut ein einziges JS-Bundle (für die Handy-Testseite als eine Datei).
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: './',
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: mode === 'single'
      ? { output: { inlineDynamicImports: true } }
      : { output: { manualChunks: { three: ['three', '@react-three/fiber', '@react-three/drei'] } } },
  },
}))
