import { useState } from 'react'
import { Bubble, Card, GrannyFace } from '../components/parts'
import { EFFORT_LEVELS, type EffortId } from '../lib/effort'

type Props = {
  initial: EffortId
  onSubmit: (effort: EffortId) => void
}

export function EffortScreen({ initial, onSubmit }: Props) {
  const [selected, setSelected] = useState<EffortId>(initial)

  return (
    <div className="flex flex-1 flex-col gap-5 px-4 pt-5 pb-8 md:px-10 md:pt-8">
      <div className="flex items-center gap-4 md:justify-center">
        <GrannyFace size={72} />
        <Bubble>今日は、出汁にどのくらい時間をかけられっか？</Bubble>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-shu">STEP 2</p>
        <h1 className="mt-1 text-2xl font-bold">出汁の取り方を選ぶ</h1>
        <p className="mt-2 text-sm text-sumi">
          こづゆの味の土台になる、出汁にかけられる時間を選んでください。
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {EFFORT_LEVELS.map((level) => {
          const on = selected === level.id
          return (
            <button
              key={level.id}
              type="button"
              aria-pressed={on}
              onClick={() => setSelected(level.id)}
              className="text-left"
            >
              <Card
                className={`h-full border-2 transition-colors ${on ? 'border-shu bg-[#fffaf5]' : 'border-transparent'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-bold">{level.label}</h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${on ? 'bg-shu text-white' : 'bg-stone-100 text-sumi'}`}
                  >
                    {level.shortLabel}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-sumi">{level.description}</p>
                <p className="mt-3 font-bold text-shu">{level.dashiTime}</p>
              </Card>
            </button>
          )
        })}
      </div>

      <p className="rounded-xl bg-white p-3 text-xs leading-relaxed text-sumi shadow-sm">
        「すぐ作る」「短時間」の出汁手順はチーム試作前の仮案です。本来の出汁と同じになるものではありません。
      </p>

      <button
        type="button"
        onClick={() => onSubmit(selected)}
        className="mt-auto w-full rounded-full bg-shu py-4 text-lg font-bold text-white shadow-lg"
      >
        この出汁の取り方で考えてもらう
      </button>
    </div>
  )
}
