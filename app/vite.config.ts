import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { loadEnv, type Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

// npm run dev のときも api/recognize.ts を動かす（本番では Vercel Functions として動く）
// API キーは app/.env.local の ANTHROPIC_API_KEY から読む
function devApi(): Plugin {
  return {
    name: 'dev-api',
    configureServer(server) {
      Object.assign(process.env, loadEnv(server.config.mode, server.config.root, ''))
      server.middlewares.use('/api/recognize', async (req, res) => {
        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)
        const mod = await server.ssrLoadModule('/api/recognize.ts')
        const handler = mod[req.method ?? '']
        if (typeof handler !== 'function') {
          res.statusCode = 405
          res.end()
          return
        }
        const response: Response = await handler(
          new Request(`http://localhost${req.originalUrl ?? ''}`, {
            method: req.method,
            headers: { 'content-type': req.headers['content-type'] ?? 'application/json' },
            body: Buffer.concat(chunks),
          }),
        )
        res.statusCode = response.status
        response.headers.forEach((value, key) => res.setHeader(key, value))
        res.end(Buffer.from(await response.arrayBuffer()))
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), devApi()],
  server: {
    // ばあちゃんの 360° 画像はリポジトリ直下の images/ から読み込む（app/ にコピーしない）
    fs: { allow: ['..'] },
  },
  test: {
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
  },
})
