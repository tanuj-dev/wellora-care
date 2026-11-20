import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// `vite` alone does not run the functions in /api, so in development /api is forwarded:
// to a local `vercel dev` (API_TARGET=http://localhost:3005) or, by default, to the live
// deployment. Both use the same Neon database, so test bookings show up in the admin panel.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.API_TARGET || 'https://wellora-care.vercel.app'
  return {
    plugins: [react()],
    server: { proxy: { '/api': { target, changeOrigin: true, secure: true } } },
  }
})
