// 写真に写っている食材を判定する Vercel Function（docs/architecture.md M1）
// AI に返させるのは kozuyu.json の pantry の id だけ。写真は判定に使ったら捨て、保存もログ出力もしない
import Anthropic from '@anthropic-ai/sdk'
import kozuyu from '../src/data/kozuyu.json' with { type: 'json' }

type PantryItem = { id: string; label: string }

export const MAX_IMAGES = 3
// Vercel Functions のリクエスト本文の上限（4.5MB）に収まるよう、1 枚あたり base64 で 1.4MB まで
const MAX_BASE64_LENGTH = 1_400_000
const MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
type MediaType = (typeof MEDIA_TYPES)[number]

export type RecognizeImage = { mediaType: MediaType; data: string }

const DEFAULT_MODEL = 'claude-opus-5-5'

// 送られてきた本文を確かめる。おかしければ、画面に出すエラー文を返す
export function parseImages(body: unknown): RecognizeImage[] | string {
  const images = (body as { images?: unknown } | null)?.images
  if (!Array.isArray(images) || images.length === 0) return '写真がありません'
  if (images.length > MAX_IMAGES) return `写真は ${MAX_IMAGES} 枚までです`
  for (const image of images) {
    const { mediaType, data } = (image ?? {}) as Partial<RecognizeImage>
    if (!MEDIA_TYPES.includes(mediaType as MediaType)) return '写真の形式が読めません'
    if (typeof data !== 'string' || data.length === 0) return '写真が空です'
    if (data.length > MAX_BASE64_LENGTH) return '写真が大きすぎます'
  }
  return images as RecognizeImage[]
}

// AI が返した id のうち、pantry にあるものだけを、重複なしで残す
export function pickKnownIds(raw: unknown, pantry: PantryItem[]): string[] {
  const ids = (raw as { ids?: unknown } | null)?.ids
  if (!Array.isArray(ids)) return []
  const known = new Set(pantry.map((p) => p.id))
  return [...new Set(ids.filter((id): id is string => typeof id === 'string' && known.has(id)))]
}

export function buildPrompt(pantry: PantryItem[]): string {
  const list = pantry.map((p) => `- ${p.id}: ${p.label}`).join('\n')
  return [
    '台所・冷蔵庫・棚・買い物袋などの写真から、こづゆ作りに使える食材と調味料を見分けてください。',
    '写っているもののうち、次の一覧に当てはまるものの id だけを ids に入れてください。',
    'パッケージやラベルの文字も読んで判断してください。',
    'はっきり見分けられないもの、一覧に無いものは入れないでください。',
    '',
    list,
  ].join('\n')
}

function outputSchema(pantry: PantryItem[]) {
  return {
    type: 'object',
    properties: {
      ids: { type: 'array', items: { type: 'string', enum: pantry.map((p) => p.id) } },
    },
    required: ['ids'],
    additionalProperties: false,
  }
}

const json = (status: number, body: unknown) => Response.json(body, { status })

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return json(503, { error: '写真の判定は、いま使えません（API キーが未設定）' })
  }

  let images: RecognizeImage[] | string
  try {
    images = parseImages(await request.json())
  } catch {
    images = '写真を読みこめませんでした'
  }
  if (typeof images === 'string') return json(400, { error: images })

  const pantry: PantryItem[] = kozuyu.pantry
  const client = new Anthropic({ timeout: 30_000, maxRetries: 1 })

  try {
    const response = await client.beta.messages.create({
      model: process.env.RECOGNIZE_MODEL || DEFAULT_MODEL,
      max_tokens: 4000,
      // 安全上の理由で断られたときは、Anthropic が勧める別のモデルで答え直す
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      // 写真の見分けは考え込む必要が薄いので、速さを優先する
      output_config: { effort: 'low', format: { type: 'json_schema', schema: outputSchema(pantry) } },
      messages: [
        {
          role: 'user',
          content: [
            ...images.map((image) => ({
              type: 'image' as const,
              source: { type: 'base64' as const, media_type: image.mediaType, data: image.data },
            })),
            { type: 'text' as const, text: buildPrompt(pantry) },
          ],
        },
      ],
    })

    if (response.stop_reason === 'refusal') {
      return json(422, { error: 'この写真は判定できませんでした。手でチェックしてください' })
    }
    const text = response.content.find((block) => block.type === 'text')
    if (!text || text.type !== 'text') return json(502, { error: '判定の結果が空でした' })
    return json(200, { ids: pickKnownIds(JSON.parse(text.text), pantry) })
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return json(429, { error: 'いま混み合っています。少し待ってからもう一度' })
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`recognize: Claude API error ${error.status}`)
      return json(502, { error: '判定に失敗しました。手でチェックしてください' })
    }
    if (error instanceof SyntaxError) {
      return json(502, { error: '判定の結果が読めませんでした' })
    }
    throw error
  }
}
