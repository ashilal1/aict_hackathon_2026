import { useEffect, useState, type ChangeEvent } from 'react'
import type { PantryItem } from '../data/types'
import { MAX_PHOTOS, recognizePhotos } from '../lib/photo'
import { Card } from './parts'

type Status =
  | { kind: 'idle' }
  | { kind: 'reading' }
  | { kind: 'done'; labels: string[] }
  | { kind: 'error'; message: string }

type Props = {
  pantry: PantryItem[]
  onRecognized: (ids: string[]) => void
}

// 写真を撮る（えらぶ）と、写っている材料を AI が見分けて、下のチェック一覧に印を付ける
export function PhotoReader({ pantry, onRecognized }: Props) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [previews, setPreviews] = useState<string[]>([])

  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews])

  const onChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])].slice(0, MAX_PHOTOS)
    event.target.value = ''
    if (files.length === 0) return
    setPreviews(files.map((file) => URL.createObjectURL(file)))
    setStatus({ kind: 'reading' })
    try {
      const ids = await recognizePhotos(files)
      onRecognized(ids)
      const labels = ids.map((id) => pantry.find((p) => p.id === id)?.label ?? id)
      setStatus({ kind: 'done', labels })
    } catch (error) {
      setStatus({ kind: 'error', message: (error as Error).message })
    }
  }

  return (
    <Card title="写真で読みとる">
      <p className="mb-3 text-sm leading-relaxed text-sumi">
        冷蔵庫や棚、買ってきた袋を撮ると、ばあちゃんが材料を見分けるよ（{MAX_PHOTOS}{' '}
        枚まで）。写真は保存しません。
      </p>

      <label
        className={`flex w-full cursor-pointer items-center justify-center rounded-full border-2 border-ai py-3 font-bold text-ai md:mx-auto md:max-w-md ${
          status.kind === 'reading' ? 'pointer-events-none opacity-50' : 'active:bg-stone-100'
        }`}
      >
        {status.kind === 'reading' ? 'ばあちゃんが写真を見とる…' : '写真を撮る・えらぶ'}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="sr-only"
          onChange={onChange}
          disabled={status.kind === 'reading'}
        />
      </label>

      {previews.length > 0 && (
        <div className="mt-3 flex justify-center gap-2">
          {previews.map((url) => (
            <img key={url} src={url} alt="" className="h-16 w-16 rounded-lg object-cover shadow-sm" />
          ))}
        </div>
      )}

      {status.kind === 'done' && (
        <p className="mt-3 text-sm leading-relaxed" role="status">
          {status.labels.length > 0 ? (
            <>
              <span className="font-bold">{status.labels.join('・')}</span>
              が見つかったよ。違ったら下で直してけろ
            </>
          ) : (
            'これというものが見つからんかった。下で手でチェックしてけろ'
          )}
        </p>
      )}
      {status.kind === 'error' && (
        <p className="mt-3 text-sm leading-relaxed text-shu" role="alert">
          {status.message}
        </p>
      )}
    </Card>
  )
}
