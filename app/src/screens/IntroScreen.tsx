import { useState } from 'react'
import type { KozuyuData } from '../data/types'
import { Bubble, GrannyFigure } from '../components/parts'
import landscape from '../../../images/aizu-landscape.webp'

type Props = {
  intro: KozuyuData['intro']
}

// 磐梯山と鶴ヶ城の景色。labeled のときは、どれが何かの札を付ける
export function Landscape({ labeled = false }: { labeled?: boolean }) {
  return (
    <div className="relative aspect-[2/1] overflow-hidden rounded-2xl">
      <img src={landscape} alt="磐梯山と鶴ヶ城の景色" className="h-full w-full object-cover" />
      {labeled && (
        <>
          <span className="absolute top-[10%] left-[62%] rounded-full bg-urushi/85 px-2.5 py-0.5 text-xs font-bold text-kin md:text-sm">
            磐梯山
          </span>
          <span className="absolute top-[42%] left-[74%] rounded-full bg-urushi/85 px-2.5 py-0.5 text-xs font-bold text-kin md:text-sm">
            鶴ヶ城
          </span>
        </>
      )}
    </div>
  )
}

// オンボーディングの「こづゆの説明」のページ
export function IntroScreen({ intro }: Props) {
  const [touched, setTouched] = useState<Set<string>>(() => new Set())
  const [ingredient, setIngredient] = useState<string | null>(null)
  const [word, setWord] = useState(intro.words[0]?.word ?? null)

  const pick = (label: string) => {
    setIngredient(label)
    setTouched((prev) => new Set(prev).add(label))
  }
  const fact = intro.ingredients.find((item) => item.label === ingredient)?.fact
  const meaning = intro.words.find((item) => item.word === word)?.meaning

  return (
    <div className="grid gap-3 md:grid-cols-2 md:items-start md:gap-6">
      <div className="flex flex-col gap-3">
        <Landscape labeled />

        <div className="flex items-center gap-3">
          <GrannyFigure />
          <Bubble>{intro.greeting}</Bubble>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <section aria-label="会津の食材">
          <p className="mb-1.5 text-xs font-bold text-sumi">
            材料を押してみっせ（触った数 {touched.size} / {intro.ingredients.length}）
          </p>
          <div className="grid grid-cols-2 gap-2">
            {intro.ingredients.map((item) => {
              const on = ingredient === item.label
              return (
                <button
                  key={item.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => pick(item.label)}
                  className={`min-h-[52px] rounded-xl border-2 text-[15px] font-bold transition-colors ${
                    on ? 'border-shu bg-shu text-white' : 'border-line bg-white'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
          {fact && (
            <p
              className="mt-2 rounded-xl border-l-4 border-kincha bg-white px-3 py-2.5 text-sm leading-relaxed"
              role="status"
            >
              {fact}
            </p>
          )}
        </section>

        <section aria-label="会津の言葉">
          <p className="mb-1.5 text-xs font-bold text-sumi">会津の言葉（押すと意味が出っぞ）</p>
          <div className="flex flex-wrap gap-2">
            {intro.words.map((item) => {
              const on = word === item.word
              return (
                <button
                  key={item.word}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setWord(item.word)}
                  className={`min-h-11 rounded-full border-2 px-3.5 text-[15px] font-bold transition-colors ${
                    on ? 'border-ai bg-ai text-white' : 'border-line bg-white'
                  }`}
                >
                  {item.word}
                </button>
              )
            })}
          </div>
          {meaning && <p className="mt-2 text-sm leading-relaxed text-sumi">{meaning}</p>}
        </section>
      </div>
    </div>
  )
}
