import { useState } from 'react'
import { Bubble, GrannyFace, Stepper } from '../components/parts'
import { EFFORT_LEVELS, type EffortId } from '../lib/effort'

type Props = {
  initial: EffortId
  onSubmit: (effort: EffortId) => void
}

export function EffortScreen({ initial, onSubmit }: Props) {
  const [selected, setSelected] = useState<EffortId>(initial)

  return (
    <div className="flex flex-1 flex-col gap-3 px-4 pt-3 pb-8 md:mx-auto md:w-full md:max-w-xl md:gap-5 md:pt-6">
      <Stepper current={3} />
      <div className="flex items-center gap-3 md:justify-center">
        <GrannyFace size={52} />
        <Bubble>今日は、出汁にどのくらい時間をかけられっか？</Bubble>
      </div>
      <div>
        <p className="text-[13px] font-bold text-shu">作り方の手軽さ</p>
        <h1 className="mt-0.5 text-[22px] font-bold">出汁の取り方を選ぶ</h1>
        <p className="mt-1 text-[13px] text-sumi">
          こづゆの味の土台になる、出汁にかけられる時間を選んでください。
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {EFFORT_LEVELS.map((level) => {
          const on = selected === level.id
          return (
            <button
              key={level.id}
              type="button"
              aria-pressed={on}
              onClick={() => setSelected(level.id)}
              className={`rounded-2xl border-2 p-3.5 text-left transition-colors ${
                on ? 'border-shu bg-[#fffaf5]' : 'border-line bg-white'
              }`}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="text-lg font-bold">
                  {on && '✓ '}
                  {level.label}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    on ? 'bg-shu text-white' : 'bg-sand text-sumi'
                  }`}
                >
                  {on ? '選択中' : level.shortLabel}
                </span>
              </span>
              <span className="mt-1.5 block text-[13px] leading-normal text-sumi">{level.description}</span>
              {on && <span className="mt-2 block text-sm font-bold text-shu">{level.dashiTime}</span>}
            </button>
          )
        })}
      </div>

      <p className="rounded-xl bg-white px-3 py-2.5 text-xs leading-relaxed text-sumi">
        「すぐ作る」「短時間」の出汁手順はチーム試作前の仮案です。本来の出汁と同じになるものではありません。
      </p>

      <button
        type="button"
        onClick={() => onSubmit(selected)}
        className="mt-auto min-h-14 w-full rounded-full bg-shu text-[17px] font-bold text-white shadow-lg"
      >
        この出汁の取り方で考えてもらう
      </button>
    </div>
  )
}
