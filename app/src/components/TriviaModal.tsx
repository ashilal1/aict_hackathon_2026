import { useEffect, useRef } from 'react'
import type { Row } from '../lib/buildResult'

type Props = {
  row: Row
  onClose: () => void
}

export function TriviaModal({ row, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previous?.focus()
    }
  }, [onClose])

  if (!row.trivia) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ai/60 p-4 md:items-center"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="trivia-title"
        className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-3xl bg-kinari p-5 shadow-2xl md:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-shu">代替食材の豆知識</p>
            <h2 id="trivia-title" className="mt-1 text-2xl font-bold">
              {row.original} → {row.text}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="豆知識を閉じる"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-xl font-bold shadow-sm"
          >
            ×
          </button>
        </div>

        <dl className="mt-5 space-y-4">
          <div className="rounded-2xl bg-white p-4">
            <dt className="font-bold">どこが違う？</dt>
            <dd className="mt-1 leading-relaxed text-sumi">{row.trivia.difference}</dd>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <dt className="font-bold">使うときのコツ</dt>
            <dd className="mt-1 leading-relaxed text-sumi">{row.trivia.tip}</dd>
          </div>
          <div className="rounded-2xl border border-kincha bg-white p-4">
            <dt className="font-bold text-kincha">知っておいてほしいこと</dt>
            <dd className="mt-1 leading-relaxed text-sumi">{row.trivia.caution}</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
