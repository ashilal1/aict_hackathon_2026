import { useEffect, useRef, useState } from 'react'
import { BekoProgress } from '../components/parts'
import { GRANNY_FRONT, SPIN_MS, loadSpinImages, spinBlend, type SpinFrame } from '../lib/granny'

const CANVAS_SIZE = 1024
// 画像がこの時間でそろわなければ、回さずに正面の画像のまま進める
const LOAD_WAIT_MS = 2500

function drawFrame(ctx: CanvasRenderingContext2D, frame: SpinFrame, alpha: number) {
  const half = CANVAS_SIZE / 2
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(half, half)
  ctx.rotate((frame.rot * Math.PI) / 180)
  ctx.drawImage(frame.image, -half, -half, CANVAS_SIZE, CANVAS_SIZE)
  ctx.restore()
}

// t のときの絵を描く。lighter で足すと、切り替え中に重なった部分が透けずに混ざる
function drawSpin(ctx: CanvasRenderingContext2D, frames: SpinFrame[], t: number) {
  const { from, to, fade } = spinBlend(t)
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  ctx.globalCompositeOperation = 'lighter'
  if (fade < 1) drawFrame(ctx, frames[from], 1 - fade)
  if (fade > 0) drawFrame(ctx, frames[to], fade)
}

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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [spinning, setSpinning] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let stopped = false
    let raf = 0

    const run = (frames: SpinFrame[] | null) => {
      if (stopped) return
      const ctx = canvasRef.current?.getContext('2d')
      const spin = frames && ctx ? { frames, ctx } : null
      const spinMs = spin ? SPIN_MS : 0
      const total = spinMs + HOLD_MS
      if (spin) {
        spin.ctx.imageSmoothingQuality = 'high'
        drawSpin(spin.ctx, spin.frames, 0)
        setSpinning(true)
      }
      const start = performance.now()
      const tick = (now: number) => {
        const elapsed = now - start
        if (spin) drawSpin(spin.ctx, spin.frames, elapsed / spinMs)
        setProgress(Math.min(elapsed / total, 1))
        if (elapsed < total) {
          raf = requestAnimationFrame(tick)
        } else {
          onDone()
        }
      }
      raf = requestAnimationFrame(tick)
    }

    if (reduceMotion) {
      run(null)
    } else {
      const giveUp = new Promise<null>((resolve) => setTimeout(() => resolve(null), LOAD_WAIT_MS))
      void Promise.race([loadSpinImages(), giveUp]).then(run)
    }

    return () => {
      stopped = true
      cancelAnimationFrame(raf)
    }
  }, [reduceMotion, onDone])

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
        {!spinning && (
          <img
            src={GRANNY_FRONT}
            alt="こづゆばあちゃんが材料を見ている"
            className="mx-auto aspect-square max-h-[52dvh] w-full object-contain"
          />
        )}
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          role="img"
          aria-label="こづゆばあちゃんが材料を見ている"
          className={`mx-auto aspect-square max-h-[52dvh] w-full object-contain ${spinning ? '' : 'hidden'}`}
        />
        <div className="absolute top-[30%] left-0 rounded-2xl bg-white px-4 py-2 text-lg font-bold shadow-md md:-left-8 md:text-xl">
          {line}
        </div>
      </div>

      {labels && labels.length > 0 && (
        <div className="relative w-full max-w-md rounded-2xl bg-white p-3.5 shadow-sm">
          <p className="mb-2 text-[13px] font-bold text-sumi">見てもらってる材料</p>
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
        <BekoProgress value={progress} label="判定の進み具合" />
        <p className="mt-3 text-center text-lg font-bold">こづゆばあちゃんが材料を見てっぞ…</p>
      </div>
    </div>
  )
}
