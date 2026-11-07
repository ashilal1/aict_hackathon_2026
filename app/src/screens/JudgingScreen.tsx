import { useEffect, useRef, useState } from 'react'
import { BekoProgress } from '../components/parts'
import { GRANNY_FRONT, loadSpinVideo } from '../lib/granny'

// 動画がこの時間でそろわなければ、回さずに正面の画像のまま進める
const LOAD_WAIT_MS = 2500
// 横と縦に 1 周ずつ回って正面で止まり、少し間を置いて結果へ進む
const HOLD_MS = 700
// 動画の長さが読めなかったときの回転の時間
const SPIN_MS = 3000
// 再生が止まってしまっても、この時間を過ぎたら先へ進める
const STALL_MS = 1500

type Props = {
  line: string
  // 見てもらっている材料（材料の判定のときだけ出す）
  labels?: string[]
  onDone: () => void
}

export function JudgingScreen({ line, labels, onDone }: Props) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const videoRef = useRef<HTMLVideoElement>(null)
  const [spinning, setSpinning] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let stopped = false
    let raf = 0
    const element = videoRef.current

    // 動画を回せたら回し、回せなければ正面の画像のまま HOLD_MS だけ待つ
    const run = async (src: string | null) => {
      if (stopped) return
      let video = src ? element : null
      let spinMs = 0
      if (video && src) {
        video.src = src
        try {
          // 省電力モードなどで自動再生できない端末では、回さずに進める
          await video.play()
          if (stopped) return
          spinMs = Number.isFinite(video.duration) ? video.duration * 1000 : SPIN_MS
          setSpinning(true)
        } catch {
          video = null
        }
      }
      if (stopped) return
      const total = spinMs + HOLD_MS
      const start = performance.now()
      let holdStart: number | null = null
      const tick = (now: number) => {
        if (holdStart === null && (!video || video.ended || now - start > spinMs + STALL_MS)) holdStart = now
        const spun = video ? Math.min(video.currentTime * 1000, spinMs) : 0
        const held = holdStart === null ? 0 : now - holdStart
        setProgress(Math.min((spun + held) / total, 1))
        if (held < HOLD_MS) {
          raf = requestAnimationFrame(tick)
        } else {
          onDone()
        }
      }
      raf = requestAnimationFrame(tick)
    }

    if (reduceMotion) {
      void run(null)
    } else {
      const giveUp = new Promise<null>((resolve) => setTimeout(() => resolve(null), LOAD_WAIT_MS))
      void Promise.race([loadSpinVideo(), giveUp]).then(run)
    }

    return () => {
      stopped = true
      cancelAnimationFrame(raf)
      element?.pause()
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
        {/* 全身が収まるように、正方形の画像をそのまま見せる。回っている間は同じ場所に動画を重ねる */}
        <img
          src={GRANNY_FRONT}
          alt="こづゆばあちゃんが材料を見ている"
          className={`mx-auto aspect-square max-h-[52dvh] w-full object-contain ${spinning ? 'invisible' : ''}`}
        />
        {/* 動画の背景は白。multiply で重ねると白が消えて、後ろの生成りと山が見える */}
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          aria-hidden
          className={`absolute inset-0 h-full w-full object-contain mix-blend-multiply ${spinning ? '' : 'opacity-0'}`}
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
