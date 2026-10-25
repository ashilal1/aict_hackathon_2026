import type { ReactNode } from 'react'
import { GRANNY_FRONT } from '../lib/granny'
import type { RowVerdict } from '../lib/buildResult'

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

const TAG: Record<RowVerdict, { label: string; className: string }> = {
  real: { label: '本物', className: 'bg-kincha text-white' },
  ok: { label: '代用OK', className: 'bg-ai text-white' },
  irreplaceable: { label: '代わりがきかない', className: 'bg-shu text-white' },
  omit: { label: '省略', className: 'bg-stone-200 text-sumi' },
}

export function VerdictTag({ verdict }: { verdict: RowVerdict }) {
  const tag = TAG[verdict]
  return (
    <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold whitespace-nowrap ${tag.className}`}>
      {tag.label}
    </span>
  )
}

export function DraftNote() {
  return (
    <p className="rounded-lg border border-dashed border-kincha bg-kinari px-3 py-2 text-xs leading-relaxed text-sumi">
      <span className="mr-1 rounded bg-kincha px-1.5 py-0.5 font-bold text-white">仮</span>
      いまの分量・手順・判定は、チームの試作前の仮の値です
    </p>
  )
}
