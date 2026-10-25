import { useEffect, useState } from 'react'
import { GRANNY_FRAMES } from '../lib/granny'

// 後ろ向き（180°）から半周して正面で止まり、少し間を置いて結果へ進む
const SPIN_MS = 1600
const HOLD_MS = 700

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

type Props = {
  line: string
  onDone: () => void
}

export function JudgingScreen({ line, onDone }: Props) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [frame, setFrame] = useState(reduceMotion ? 0 : 18)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const spinMs = reduceMotion ? 0 : SPIN_MS
    const total = spinMs + HOLD_MS
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const elapsed = now - start
      if (spinMs > 0) {
        const azimuth = 180 + 180 * easeOutCubic(Math.min(elapsed / spinMs, 1))
        setFrame(Math.round(azimuth / 10) % GRANNY_FRAMES.length)
      }
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

  return (
    <div className="flex flex-1 flex-col px-4 pt-6 pb-8">
      <div className="relative min-h-80 flex-1 overflow-hidden">
        {/* 全身の画像から上半身を、空いている高さいっぱいに見せる */}
        <img
          src={GRANNY_FRAMES[frame]}
          alt="こづゆばあちゃんが材料を見ている"
          className="absolute top-[-4%] left-1/2 h-[170%] w-auto max-w-none -translate-x-[48%]"
        />
        <div className="absolute top-[38%] left-0 rounded-2xl bg-white px-4 py-2 text-lg font-bold shadow-md">
          {line}
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-stone-200">
          <div className="h-full rounded-full bg-ai" style={{ width: `${progress * 100}%` }} />
        </div>
        <p className="mt-3 text-center text-lg font-bold">ばあちゃんが材料をみとる…</p>
      </div>
    </div>
  )
}
