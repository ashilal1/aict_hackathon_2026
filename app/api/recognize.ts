// 写真に写っている食材を判定する Vercel Function（docs/architecture.md M1）
// AI には写っている食材をすべて書き出させ、こづゆの材料（kozuyu.json の pantry）に当たるものには id を付けさせる
// 写真は判定に使ったら捨て、保存もログ出力もしない
import Anthropic from '@anthropic-ai/sdk'
import kozuyu from '../src/data/kozuyu.json' with { type: 'json' }

type PantryItem = { id: string; label: string }
type Food = { name: string; pantryId: string | null }

export const MAX_IMAGES = 3
// Vercel Functions のリクエスト本文の上限（4.5MB）に収まるよう、1 枚あたり base64 で 1.4MB まで
const MAX_BASE64_LENGTH = 1_400_000
const MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
type MediaType = (typeof MEDIA_TYPES)[number]

export type RecognizeImage = { mediaType: MediaType; data: string }

const DEFAULT_MODEL = 'claude-opus-5-5'
// pantry の材料に当たらない食材に、AI が付ける印
const NOT_IN_PANTRY = 'none'
// 構造化出力のスキーマでは長さや個数を縛れないので、受け取ってから切る
const MAX_FOODS = 60
const MAX_NAME_LENGTH = 30

// 送られてきた本文を確かめる。おかしければ、画面に出すエラー文を返す
export function parseImages(body: unknown): RecognizeImage[] | string {
  const images = (body as { images?: unknown } | null)?.images
  if (!Array.isArray(images) || images.length === 0) return '写真がねえぞ'
  if (images.length > MAX_IMAGES) return `写真は ${MAX_IMAGES} 枚までだ`
  for (const image of images) {
    const { mediaType, data } = (image ?? {}) as Partial<RecognizeImage>
    if (!MEDIA_TYPES.includes(mediaType as MediaType)) return '写真の形式が読めねえ'
    if (typeof data !== 'string' || data.length === 0) return '写真が空だ'
    if (data.length > MAX_BASE64_LENGTH) return '写真が大きすぎる'
  }
  return images as RecognizeImage[]
}

// AI が返した食材を整える。名前の重複と空の名前は捨て、pantry に無い id は「当たらない」扱いにする
export function pickFoods(raw: unknown, pantry: PantryItem[]): Food[] {
  const foods = (raw as { foods?: unknown } | null)?.foods
  if (!Array.isArray(foods)) return []
  const known = new Set(pantry.map((p) => p.id))
  const byName = new Map<string, Food>()
  for (const food of foods) {
    const { name, pantryId } = (food ?? {}) as { name?: unknown; pantryId?: unknown }
    if (typeof name !== 'string') continue
    const trimmed = name.trim().slice(0, MAX_NAME_LENGTH)
    if (trimmed === '' || byName.has(trimmed)) continue
    const id = typeof pantryId === 'string' && known.has(pantryId) ? pantryId : null
    byName.set(trimmed, { name: trimmed, pantryId: id })
  }
  return [...byName.values()].slice(0, MAX_FOODS)
}

export function buildPrompt(pantry: PantryItem[]): string {
  const list = pantry.map((p) => `- ${p.id}: ${p.label}`).join('\n')
  return [
    '台所・冷蔵庫・棚・買い物袋などの写真に写っている食材と調味料を、すべて foods に書き出してください。',
    '何の料理に使えるかは考えず、見つけたものを一つ残らず挙げてください。棚の奥、ドアポケット、袋や新聞紙の中も確かめ、パッケージやラベルの文字も読んでください。',
    'name は「大根」「豚肉」のような一般的な日本語の名前にしてください。商品名やメーカー名は書かないでください。中身が分からない容器は入れないでください。',
    '',
    '書き出した食材が次の材料の一覧と同じものなら、pantryId にその id を入れてください。',
    '呼び方や書き方が違うだけなら同じものです（しらたきは糸こんにゃく、人参はにんじん、乾しいたけは干し椎茸）。',
    `一覧に無いもの、形や色が似ているだけの別の食材は、pantryId を ${NOT_IN_PANTRY} にしてください（板こんにゃくは糸こんにゃくではない。大根や長芋は里芋ではない）。`,
    '',
    list,
  ].join('\n')
}

function outputSchema(pantry: PantryItem[]) {
  return {
    type: 'object',
    properties: {
      foods: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            pantryId: { type: 'string', enum: [...pantry.map((p) => p.id), NOT_IN_PANTRY] },
          },
          required: ['name', 'pantryId'],
          additionalProperties: false,
        },
      },
    },
    required: ['foods'],
    additionalProperties: false,
  }
}

const json = (status: number, body: unknown) => Response.json(body, { status })

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return json(503, { error: '写真の判定は、今使えねえ（API キーが未設定）' })
  }

  let images: RecognizeImage[] | string
  try {
    images = parseImages(await request.json())
  } catch {
    images = '写真を読み込めねがった'
  }
  if (typeof images === 'string') return json(400, { error: images })

  const pantry: PantryItem[] = kozuyu.pantry
  const client = new Anthropic({ timeout: 45_000, maxRetries: 1 })

  try {
    const response = await client.beta.messages.create({
      model: process.env.RECOGNIZE_MODEL || DEFAULT_MODEL,
      // 食材をすべて書き出すので、途中で切れないよう余裕を持たせる
      max_tokens: 8000,
      // 安全上の理由で断られたときは、Anthropic が勧める別のモデルで答え直す
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      // low より誤検出が減る。high まで上げても結果はほぼ変わらない（2026-11-06 に実測）
      output_config: { effort: 'medium', format: { type: 'json_schema', schema: outputSchema(pantry) } },
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
      return json(422, { error: 'この写真は見分けらんねがった。手で選んでけさい' })
    }
    const text = response.content.find((block) => block.type === 'text')
    if (!text || text.type !== 'text') return json(502, { error: '判定の結果が空だった' })
    return json(200, { foods: pickFoods(JSON.parse(text.text), pantry) })
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return json(429, { error: '今混んでる。ちっと待ってからもう一回やってけさい' })
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`recognize: Claude API error ${error.status}`)
      return json(502, { error: 'うまぐ見られねがった。手で選んでけさい' })
    }
    if (error instanceof SyntaxError) {
      return json(502, { error: '判定の結果が読めねがった' })
    }
    throw error
  }
}
