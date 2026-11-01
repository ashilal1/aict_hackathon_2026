import type { ReactNode } from 'react'
import { GRANNY_FRONT } from '../lib/granny'

// 正面の全身画像から顔のまわりだけを丸く切り抜く
export function GrannyFace({ size = 64 }: { size?: number }) {
  const scale = 5
  const width = size * scale
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border-2 border-white bg-white shadow-md"
      style={{ width: size, height: size }}
    >
      <img
        src={GRANNY_FRONT}
        alt="こづゆばあちゃん"
        className="absolute max-w-none"
        style={{ width, left: size / 2 - width * 0.465, top: size / 2 - width * 0.185 }}
      />
    </div>
  )
}

export function Bubble({ children }: { children: ReactNode }) {
  return (
    <div className="relative rounded-2xl bg-white px-4 py-3 text-base leading-snug font-bold shadow-sm">
      <span className="absolute top-1/2 -left-2 h-4 w-4 -translate-y-1/2 rotate-45 bg-white" aria-hidden />
      <span className="relative">{children}</span>
    </div>
  )
}

export function Card({
  title,
  className = '',
  children,
}: {
  title?: string
  className?: string
  children: ReactNode
}) {
  return (
    <section className={`rounded-2xl bg-white p-4 shadow-sm md:p-6 ${className}`}>
      {title && <h2 className="mb-3 text-lg font-bold">{title}</h2>}
      {children}
    </section>
  )
}

export function StepHeader({ step, title }: { step: number; title: string }) {
  return (
    <div className="text-center">
      <p className="text-sm font-bold text-shu">STEP {step} / 4</p>
      <h1 className="mt-1 text-2xl font-bold">{title}</h1>
      <div className="mx-auto mt-3 flex max-w-40 gap-2" aria-hidden>
        {[1, 2, 3, 4].map((number) => (
          <span
            key={number}
            className={`h-1.5 flex-1 rounded-full ${number <= step ? 'bg-shu' : 'bg-stone-200'}`}
          />
        ))}
      </div>
    </div>
  )
}

export function DraftNote() {
  return (
    <p className="rounded-lg border border-dashed border-kincha bg-kinari px-3 py-2 text-xs leading-relaxed text-sumi">
      <span className="mr-1 rounded bg-kincha px-1.5 py-0.5 font-bold text-white">仮</span>
      いまの分量・手順は、チームの試作前の仮の値です
    </p>
  )
}
