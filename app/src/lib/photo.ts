// 写真をブラウザの中で縮めて JPEG にし、/api/recognize に送る
// 長い辺を 1568px までにすると、Claude の画像の上限に収まり、送る量も小さくなる
const MAX_SIDE = 1568
const JPEG_QUALITY = 0.85

export const MAX_PHOTOS = 3

async function toJpegBase64(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY).split(',')[1]
}

// 写真に写っている材料の id を返す。失敗したら、画面に出せる文のエラーを投げる
export async function recognizePhotos(files: File[]): Promise<string[]> {
  let images: { mediaType: 'image/jpeg'; data: string }[]
  try {
    images = await Promise.all(
      files.slice(0, MAX_PHOTOS).map(async (file) => ({
        mediaType: 'image/jpeg' as const,
        data: await toJpegBase64(file),
      })),
    )
  } catch {
    throw new Error('写真を開けませんでした。別の写真でためしてください')
  }

  let response: Response
  try {
    response = await fetch('/api/recognize', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ images }),
    })
  } catch {
    throw new Error('つながりませんでした。手でチェックしてください')
  }
  const body = (await response.json().catch(() => ({}))) as { ids?: string[]; error?: string }
  if (!response.ok) throw new Error(body.error ?? '判定に失敗しました。手でチェックしてください')
  return body.ids ?? []
}
