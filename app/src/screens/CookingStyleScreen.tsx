import { useState } from 'react'
import { Bubble, Card, GrannyFace, StepHeader } from '../components/parts'
import { COOKING_STYLES, type CookingStyleId } from '../lib/cookingStyle'

type Props = {
  initial: CookingStyleId | null
  onSubmit: (style: CookingStyleId) => void
}

export function CookingStyleScreen({ initial, onSubmit }: Props) {
  const [selected, setSelected] = useState<CookingStyleId | null>(initial)

  return (
    <div className="flex flex-1 flex-col gap-5 px-4 pt-5 pb-8 md:px-10 md:pt-8">
      <StepHeader step={1} title="どんなこづゆを作りたい？" />
      <div className="flex items-center gap-4 md:justify-center">
        <GrannyFace size={72} />
        <Bubble>今日は、どんな作り方にすっか？</Bubble>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {COOKING_STYLES.map((style) => {
          const on = selected === style.id
          return (
            <button
              key={style.id}
              type="button"
              aria-pressed={on}
              onClick={() => setSelected(style.id)}
              className="rounded-2xl text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-kincha/50"
            >
              <Card
                className={`h-full border-2 transition-colors ${on ? 'border-shu bg-[#fffaf5]' : 'border-transparent'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-bold">{style.label}</h2>
                  {on && (
                    <span className="rounded-full bg-shu px-2 py-1 text-xs font-bold text-white">
                      ✓ 選択中
                    </span>
                  )}
                </div>
                <p className="mt-3 leading-relaxed text-sumi">{style.lead}</p>
                <p className="mt-4 text-sm font-bold text-shu">優先すること：{style.priority}</p>
              </Card>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        disabled={!selected}
        onClick={() => selected && onSubmit(selected)}
        className="mt-auto min-h-12 w-full rounded-full bg-shu py-4 text-lg font-bold text-white shadow-lg transition-opacity focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-kincha/50 disabled:opacity-40"
      >
        この作り方で材料を選ぶ
      </button>
    </div>
  )
}
