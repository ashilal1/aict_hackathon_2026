import { useState } from 'react'
import type { KozuyuData } from '../data/types'
import { Bubble, GrannyFace } from '../components/parts'

type Props = {
  intro: KozuyuData['intro']
  onStart: () => void
}

// 磐梯山と鶴ヶ城の景色（飾り）
function Landscape() {
  return (
    <div
      role="img"
      aria-label="磐梯山と鶴ヶ城の景色"
      className="relative h-[132px] overflow-hidden rounded-2xl bg-gradient-to-b from-[#c9d6e3] via-[#e8eef3] to-kinari md:h-48"
    >
      <svg
        viewBox="0 0 358 132"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden
        className="absolute inset-0 h-full w-full"
      >
        <polygon
          points="0,132 0,96 46,62 96,44 150,22 196,34 236,18 280,44 322,62 358,84 358,132"
          fill="#7d93a6"
        />
        <polygon points="150,22 196,34 176,40 164,36 150,30" fill="#f5f9fc" />
        <polygon points="226,30 236,18 246,30 236,24" fill="#f5f9fc" />
        <rect x="0" y="122" width="358" height="10" fill="#4f6b5a" />
        <rect x="228" y="106" width="34" height="26" fill="#f5efe3" />
        <polygon points="222,106 268,106 262,98 228,98" fill="#2b2f3a" />
        <rect x="280" y="98" width="46" height="34" fill="#f5efe3" />
        <polygon points="272,98 334,98 324,88 282,88" fill="#2b2f3a" />
        <polygon points="282,88 324,88 316,78 290,78" fill="#2b2f3a" />
        <polygon points="290,78 316,78 310,68 296,68" fill="#2b2f3a" />
        <rect x="301" y="60" width="4" height="8" fill="#2b2f3a" />
      </svg>
    </div>
  )
}

export function IntroScreen({ intro, onStart }: Props) {
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
    <div className="flex flex-1 flex-col gap-3 px-4 pt-2 pb-6 md:mx-auto md:w-full md:max-w-xl md:pt-6">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-bold md:hidden">こづゆばあちゃんの台所</p>
        <button
          type="button"
          onClick={onStart}
          className="ml-auto min-h-11 px-3 text-sm font-bold text-sumi underline"
        >
          スキップ
        </button>
      </div>

      <Landscape />

      <div className="flex items-start gap-3">
        <GrannyFace size={56} />
        <Bubble>{intro.greeting}</Bubble>
      </div>

      <section aria-label="会津の食材">
        <p className="mb-1.5 text-xs font-bold text-sumi">
          材料をタップ（触った数 {touched.size} / {intro.ingredients.length}）
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
        <p className="mb-1.5 text-xs font-bold text-sumi">会津の言葉（タップで意味）</p>
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

      <button
        type="button"
        onClick={onStart}
        className="mt-auto min-h-14 w-full rounded-full bg-shu text-lg font-bold text-white shadow-lg"
      >
        材料を選びにいく
      </button>
    </div>
  )
}
