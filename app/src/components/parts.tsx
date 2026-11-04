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
  omit: { label: '省略', className: 'bg-sand text-sumi' },
}

export function VerdictTag({ verdict }: { verdict: RowVerdict }) {
  const tag = TAG[verdict]
  return (
    <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold whitespace-nowrap ${tag.className}`}>
      {tag.label}
    </span>
  )
}

export function DraftNote({ children }: { children?: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-kincha bg-kinari px-3 py-2 text-xs leading-relaxed text-sumi">
      <span className="mr-1 rounded bg-kincha-dark px-1.5 py-0.5 font-bold text-white">仮</span>
      {children ?? 'いまの分量・手順・判定は、チームの試作前の仮の値です'}
    </p>
  )
}

const STEPS = ['材料', '判定', '作り方']

// 材料 → 判定 → 作り方 のどこにいるか。済んだところには ✓ を付ける
export function Stepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol
      aria-label="進み具合"
      className="flex items-center gap-1.5 text-xs font-bold text-sumi md:mx-auto md:w-full md:max-w-md"
    >
      {STEPS.map((label, i) => {
        const step = i + 1
        const done = step < current
        const here = step === current
        return (
          <li key={label} className="contents">
            {i > 0 && <span aria-hidden className={`h-0.5 flex-1 ${done || here ? 'bg-ai' : 'bg-line'}`} />}
            <span
              aria-current={here ? 'step' : undefined}
              className={`flex items-center gap-1.5 ${here ? 'text-shu' : done ? 'text-ai' : ''}`}
            >
              <span
                className={`inline-flex h-[22px] w-[22px] items-center justify-center rounded-full ${
                  here ? 'bg-shu text-white' : done ? 'bg-ai text-white' : 'border-2 border-line bg-white'
                }`}
              >
                {done ? '✓' : step}
              </span>
              {here && step === 2 ? '判定の結果' : label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
