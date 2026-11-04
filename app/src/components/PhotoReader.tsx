import { useEffect, useState, type ChangeEvent } from 'react'
import type { PantryItem } from '../data/types'
import { MAX_PHOTOS, recognizePhotos } from '../lib/photo'

type Status =
  | { kind: 'idle' }
  | { kind: 'reading' }
  | { kind: 'done'; labels: string[] }
  | { kind: 'error'; message: string }

// input: 材料入力の画面。add: 結果を見たあとに、足りない材料を撮り足す
type Mode = 'input' | 'add'

const COPY: Record<Mode, { button: string; lead: string; found: string; none: string }> = {
  input: {
    button: '写真で材料を撮る',
    lead: '撮った写真から、食材を自動で見つけます',
    found: 'が見つかったよ。違ったら下で直してけさい',
    none: 'これというものが見つからんかった。下の「＋ 材料を足す」から選んでけさい',
  },
  add: {
    button: '写真でもう一度撮る',
    lead: '撮り忘れた材料があったら、もう一度撮ってけさい',
    found: 'を足したよ。下の一覧を見てけさい',
    none: 'これというものが見つからんかった。下の「材料を足す」から選んでけさい',
  },
}

type Props = {
  pantry: PantryItem[]
  onRecognized: (ids: string[]) => void
  mode?: Mode
}

// 写真を撮る（えらぶ）と、写っている材料を AI が見分けて、チェック一覧に印を付ける
export function PhotoReader({ pantry, onRecognized, mode = 'input' }: Props) {
  const copy = COPY[mode]
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

  const reading = status.kind === 'reading'

  return (
    <div>
      <label
        className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-kincha bg-[#fffdf7] text-left md:mx-auto md:max-w-md ${
          mode === 'input' ? 'min-h-16 px-3.5 py-2.5' : 'min-h-11 justify-center rounded-xl px-3 py-2'
        } ${reading ? 'pointer-events-none opacity-50' : 'active:bg-stone-100'}`}
      >
        {mode === 'input' && (
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ai"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
          </span>
        )}
        <span className="flex flex-col gap-0.5">
          <span className={`font-bold ${mode === 'input' ? 'text-[15px]' : 'text-sm'}`}>
            {reading ? 'ばあちゃんが写真を見とる…' : copy.button}
          </span>
          {mode === 'input' && (
            <span className="text-xs text-sumi">
              {copy.lead}（{MAX_PHOTOS} 枚まで・写真は保存しません）
            </span>
          )}
        </span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="sr-only"
          onChange={onChange}
          disabled={reading}
        />
      </label>
      {mode === 'add' && (
        <p className="mt-1.5 text-center text-xs text-sumi">{copy.lead}（写真は保存しません）</p>
      )}

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
              {copy.found}
            </>
          ) : (
            copy.none
          )}
        </p>
      )}
      {status.kind === 'error' && (
        <p className="mt-3 text-sm leading-relaxed text-shu" role="alert">
          {status.message}
        </p>
      )}
    </div>
  )
}
