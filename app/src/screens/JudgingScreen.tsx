import { useEffect, useState } from 'react'
import { GRANNY_FRONT, SPIN_MS, smallUrl, spinView, type GrannyView } from '../lib/granny'

// 横と縦に 1 周ずつ回って正面で止まり、少し間を置いて結果へ進む
const HOLD_MS = 700

type Props = {
  line: string
  onDone: () => void
}

export function JudgingScreen({ line, onDone }: Props) {
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
    <div className="flex flex-1 flex-col items-center px-4 pt-6 pb-8 md:justify-center">
      <div className="relative w-full max-w-md md:max-w-lg">
        {/* 全身が収まるように、正方形の画像をそのまま見せる */}
        <img
          src={src}
          alt="こづゆばあちゃんが材料を見ている"
          className="mx-auto aspect-square max-h-[68dvh] w-full object-contain"
          style={view?.rot ? { transform: `rotate(${view.rot}deg)` } : undefined}
        />
        <div className="absolute top-[30%] left-0 rounded-2xl bg-white px-4 py-2 text-lg font-bold shadow-md md:-left-8 md:text-xl">
          {line}
        </div>
      </div>

      <div className="mt-6 w-full max-w-md">
        <div className="h-2 overflow-hidden rounded-full bg-stone-200">
          <div className="h-full rounded-full bg-ai" style={{ width: `${progress * 100}%` }} />
        </div>
        <p className="mt-3 text-center text-lg font-bold">ばあちゃんが材料をみとる…</p>
      </div>
    </div>
  )
}
