import type { RecognizedFood } from '../data/types'

// 写真をブラウザの中で縮めて JPEG にし、/api/recognize に送る
// Claude が縮めずに読める上限（長い辺 2576px・3.75MP）まで残す。冷蔵庫の奥の食材は解像度で見分けが変わる
const MAX_SIDE = 2576
const MAX_PIXELS = 3_750_000
// api/recognize.ts の MAX_BASE64_LENGTH と同じ値。超えたら画質を下げて収める
const MAX_BASE64_LENGTH = 1_400_000
const JPEG_QUALITIES = [0.85, 0.7, 0.55, 0.4]

export const MAX_PHOTOS = 3

async function toJpegBase64(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(
    1,
    MAX_SIDE / Math.max(bitmap.width, bitmap.height),
    Math.sqrt(MAX_PIXELS / (bitmap.width * bitmap.height)),
  )
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  let data = ''
  for (const quality of JPEG_QUALITIES) {
    data = canvas.toDataURL('image/jpeg', quality).split(',')[1]
    if (data.length <= MAX_BASE64_LENGTH) break
  }
  return data
}

// 写真に写っている食材をすべて返す。失敗したら、画面に出せる文のエラーを投げる
export async function recognizePhotos(files: File[]): Promise<RecognizedFood[]> {
  let images: { mediaType: 'image/jpeg'; data: string }[]
  try {
    images = await Promise.all(
      files.slice(0, MAX_PHOTOS).map(async (file) => ({
        mediaType: 'image/jpeg' as const,
        data: await toJpegBase64(file),
      })),
    )
  } catch {
    throw new Error('写真を開けねがった。別の写真で試してけさい')
  }

  let response: Response
  try {
    response = await fetch('/api/recognize', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ images }),
    })
  } catch {
    throw new Error('つながんねがった。手で選んでけさい')
  }
  const body = (await response.json().catch(() => ({}))) as {
    foods?: RecognizedFood[]
    error?: string
  }
  if (!response.ok) throw new Error(body.error ?? 'うまぐ見られねがった。手で選んでけさい')
  return body.foods ?? []
}
