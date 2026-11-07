import type { ReactNode } from 'react'
import { GRANNY_FRONT } from '../lib/granny'
import type { RowVerdict } from '../lib/buildResult'
import akabeko from '../../../images/akabeko.webp'

// 正面の全身画像。front.webp は 1150px 四方で、人物は左 373・上 53 の位置に 403×1076 で入っている
export function GrannyFigure({ height = 132 }: { height?: number }) {
  const scale = height / 1076
  return (
    <div className="relative shrink-0 overflow-hidden" style={{ width: 403 * scale, height }}>
      <img
        src={GRANNY_FRONT}
        alt="こづゆばあちゃん"
        className="absolute max-w-none"
        style={{ width: 1150 * scale, left: -373 * scale, top: -53 * scale }}
      />
    </div>
  )
}

export function Bubble({ children }: { children: ReactNode }) {
  return (
    <div className="relative rounded-2xl bg-white px-4 py-3 text-base leading-snug font-bold text-balance shadow-sm">
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
  irreplaceable: { label: '代わりがきかねえ', className: 'bg-shu text-white' },
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
              {here ? (
                <img src={akabeko} alt="" className="h-7 w-auto" />
              ) : (
                <span
                  className={`inline-flex h-[22px] w-[22px] items-center justify-center rounded-full ${
                    done ? 'bg-ai text-white' : 'border-2 border-line bg-white'
                  }`}
                >
                  {done ? '✓' : step}
                </span>
              )}
              {here && step === 2 ? '判定の結果' : label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

// 進み具合のバー。赤べこがバーの上を歩く（絵は左向きなので反転する）
export function BekoProgress({ value, label }: { value: number; label: string }) {
  const percent = Math.round(value * 100)
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className="relative pt-7"
    >
      <div className="h-2.5 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-shu" style={{ width: `${percent}%` }} />
      </div>
      <img
        src={akabeko}
        alt=""
        className="absolute top-0 h-8 w-auto -translate-x-1/2 -scale-x-100"
        style={{ left: `clamp(22px, ${percent}%, calc(100% - 22px))` }}
      />
    </div>
  )
}

// アプリのいちばん伝えたい一言。「会津で。」を主役にして、会津へ来てもらう呼びかけとして見せる。
// 前半は前置きとして小さく、「会津で。」だけを朱色で特大にする。children には会津で手に入れるものを入れる
export function AizuSection({ children }: { children?: ReactNode }) {
  return (
    <section className="rounded-3xl bg-white px-5 pt-7 pb-6 shadow-md ring-2 ring-kincha md:px-10 md:pt-10 md:pb-8">
      <h2 className="text-center leading-none font-bold">
        <span className="block text-xl text-sumi md:text-3xl">代用でここまで。残りは、</span>
        <span className="mt-3 block text-[64px] tracking-wider text-shu md:mt-4 md:text-[112px]">
          会津で。
        </span>
      </h2>
      {children}
    </section>
  )
}
