import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // ばあちゃんの 360° 画像はリポジトリ直下の images/ から読み込む（app/ にコピーしない）
    fs: { allow: ['..'] },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
})
