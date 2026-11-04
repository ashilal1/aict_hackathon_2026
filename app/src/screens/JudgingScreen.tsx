import { useEffect, useState } from 'react'
import { GRANNY_FRONT, SPIN_MS, smallUrl, spinView, type GrannyView } from '../lib/granny'

// 横と縦に 1 周ずつ回って正面で止まり、少し間を置いて結果へ進む
const HOLD_MS = 700

type Props = {
  line: string
  // 見てもらっている材料（材料の判定のときだけ出す）
  labels?: string[]
  onDone: () => void
}

export function JudgingScreen({ line, labels, onDone }: Props) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [view, setView] = useState<GrannyView | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const spinMs = reduceMotion ? 0 : SPIN_MS
    const total = spinMs + HOLD_MS
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const elapsed = now - start
      // 回り終わったら null に戻し、高画質の正面の画像を出す
      setView(elapsed < spinMs ? spinView(elapsed / spinMs) : null)
      setProgress(Math.min(elapsed / total, 1))
      if (elapsed < total) {
        raf = requestAnimationFrame(tick)
      } else {
        onDone()
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduceMotion, onDone])

  const src = view ? (smallUrl(view.file) ?? GRANNY_FRONT) : GRANNY_FRONT

  return (
    <div className="relative flex flex-1 flex-col items-center px-4 pt-4 pb-8 md:justify-center">
      <svg
        viewBox="0 0 390 160"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full opacity-[.22]"
      >
        <polygon
          points="0,160 0,104 60,70 120,50 180,26 230,40 280,20 330,52 390,78 390,160"
          fill="#1f2a44"
        />
      </svg>
      <div className="relative w-full max-w-md md:max-w-lg">
        {/* 全身が収まるように、正方形の画像をそのまま見せる */}
        <img
          src={src}
          alt="こづゆばあちゃんが材料を見ている"
          className="mx-auto aspect-square max-h-[52dvh] w-full object-contain"
          style={view?.rot ? { transform: `rotate(${view.rot}deg)` } : undefined}
        />
        <div className="absolute top-[30%] left-0 rounded-2xl bg-white px-4 py-2 text-lg font-bold shadow-md md:-left-8 md:text-xl">
          {line}
        </div>
      </div>

      {labels && labels.length > 0 && (
        <div className="relative w-full max-w-md rounded-2xl bg-white p-3.5 shadow-sm">
          <p className="mb-2 text-[13px] font-bold text-sumi">見てもらっている材料</p>
          <ul className="flex flex-wrap gap-1.5">
            {labels.map((label) => (
              <li key={label} className="rounded-full bg-ai px-2.5 py-1 text-[13px] font-bold text-white">
                ✓ {label}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="relative mt-auto w-full max-w-md pt-6">
        <div
          role="progressbar"
          aria-label="判定の進み具合"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          className="h-2.5 overflow-hidden rounded-full bg-line"
        >
          <div className="h-full rounded-full bg-ai" style={{ width: `${progress * 100}%` }} />
        </div>
        <p className="mt-3 text-center text-lg font-bold">ばあちゃんが材料をみとる…</p>
      </div>
    </div>
  )
}
