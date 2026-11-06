import { useState } from 'react'
import { Bubble, Card, GrannyFigure } from '../components/parts'
import { COOKING_STYLES, type CookingStyleId } from '../lib/cookingStyle'

type Props = {
  initial: CookingStyleId | null
  onSubmit: (style: CookingStyleId) => void
}

export function CookingStyleScreen({ initial, onSubmit }: Props) {
  const [selected, setSelected] = useState<CookingStyleId | null>(initial)

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-3 pb-8 md:mx-auto md:w-full md:max-w-4xl md:gap-5 md:pt-6">
      <h1 className="text-center text-2xl font-bold md:text-3xl">どんなこづゆを作るべ？</h1>
      <div className="flex items-center gap-3 md:justify-center">
        <GrannyFigure />
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
              className="rounded-2xl text-left focus-visible:ring-4 focus-visible:ring-kincha/50 focus-visible:outline-none"
            >
              <Card className={`h-full border-2 ${on ? 'border-shu' : 'border-transparent'}`}>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-bold">{style.label}</h2>
                  {on && (
                    <span className="shrink-0 rounded-full bg-shu px-2 py-1 text-xs font-bold text-white">
                      ✓ 選んだぞ
                    </span>
                  )}
                </div>
                <p className="mt-2 leading-relaxed whitespace-pre-line text-sumi">{style.lead}</p>
                <p className="mt-3 text-xs font-bold text-sumi">優先すること</p>
                <p className="mt-0.5 text-sm font-bold text-shu">{style.priority}</p>
              </Card>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        disabled={!selected}
        onClick={() => selected && onSubmit(selected)}
        className="mt-auto min-h-14 w-full rounded-full bg-shu text-[17px] font-bold text-white shadow-lg disabled:opacity-40"
      >
        この作り方で材料を選ぶべ
      </button>
    </div>
  )
}
