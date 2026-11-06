import { useEffect, useState, type ChangeEvent } from 'react'
import type { RecognizedFood } from '../data/types'
import { MAX_PHOTOS, recognizePhotos } from '../lib/photo'

type Status =
  | { kind: 'idle' }
  | { kind: 'reading' }
  | { kind: 'done'; count: number }
  | { kind: 'error'; message: string }

// input: 材料入力の画面。add: 結果を見たあとに、足りない材料を撮り足す
type Mode = 'input' | 'add'

const COPY: Record<Mode, { button: string; lead: string; none: string }> = {
  input: {
    button: '写真で材料を撮るべ',
    lead: '撮った写真から、材料を見つけてやっからな',
    none: 'これっつうもんが見つかんねがった。下の「＋ 材料を足すべ」から選んでけさい',
  },
  add: {
    button: '写真でもう一回撮るべ',
    lead: '撮り忘れた材料があったら、もう一回撮ってけさい',
    none: 'これっつうもんが見つかんねがった。下の「材料を足すべ」から選んでけさい',
  },
}

type Props = {
  onRecognized: (foods: RecognizedFood[]) => void
  mode?: Mode
}

// 写真を撮る（えらぶ）と、写っている食材を AI がすべて書き出す
// 見つかった食材は FoundFoods に並び、使うかどうかは使う人が選ぶ
export function PhotoReader({ onRecognized, mode = 'input' }: Props) {
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
      const foods = await recognizePhotos(files)
      onRecognized(foods)
      setStatus({ kind: 'done', count: foods.length })
    } catch (error) {
      setStatus({ kind: 'error', message: (error as Error).message })
    }
  }

  const reading = status.kind === 'reading'

  return (
    <div>
      <label
        className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-kincha bg-[#fffdf7] text-left ${
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
            {reading ? 'こづゆばあちゃんが写真を見てっぞ…' : copy.button}
          </span>
          {mode === 'input' && (
            <span className="text-xs text-sumi">
              {copy.lead}（{MAX_PHOTOS} 枚まで）
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
      {mode === 'add' && <p className="mt-1.5 text-center text-xs text-sumi">{copy.lead}</p>}

      {previews.length > 0 && (
        <div className="mt-3 flex justify-center gap-2">
          {previews.map((url) => (
            <img key={url} src={url} alt="" className="h-16 w-16 rounded-lg object-cover shadow-sm" />
          ))}
        </div>
      )}

      {status.kind === 'done' && (
        <p className="mt-3 text-sm leading-relaxed" role="status">
          {status.count > 0 ? (
            <>
              <span className="font-bold">写真から {status.count} 個の食材を見つけたぞ。</span>
              「見つかった材料」から、使うもんを選んでけさい
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
