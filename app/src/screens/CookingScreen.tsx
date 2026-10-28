import { useState } from 'react'
import type { Template } from '../data/types'
import { cookingStepsFor, type EffortLevel } from '../lib/effort'
import { Bubble, Card, GrannyFace } from '../components/parts'

type Props = {
  template: Template
  effort: EffortLevel
  tips: string[]
  onComplete: () => void
}

export function CookingScreen({ template, effort, tips, onComplete }: Props) {
  const [step, setStep] = useState(0)
  const steps = cookingStepsFor(template.steps, effort)
  const currentTip = tips[step % tips.length]
  const isLast = step === steps.length - 1

  return (
    <div className="flex flex-1 flex-col gap-5 px-4 pt-5 pb-8 md:px-10 md:pt-8">
      <div className="flex items-center gap-4 md:justify-center">
        <GrannyFace size={64} />
        <Bubble>{isLast ? 'もう少しだ。焦らず仕上げっせ' : '一つずつ進めれば大丈夫だ'}</Bubble>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-sm font-bold">
          <span>{effort.label}</span>
          <span>
            {step + 1} / {steps.length}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-stone-200">
          <div
            className="h-full rounded-full bg-shu transition-all"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <Card>
        <p className="text-sm font-bold text-shu">いまやること</p>
        <p className="mt-3 text-2xl leading-relaxed font-bold">{steps[step]}</p>
      </Card>

      <Card title="ばあちゃんの豆知識">
        <p className="leading-relaxed text-sumi">{currentTip}</p>
      </Card>

      <button
        type="button"
        onClick={() => (isLast ? onComplete() : setStep((value) => value + 1))}
        className="mt-auto w-full rounded-full bg-shu py-4 text-lg font-bold text-white shadow-lg"
      >
        {isLast ? 'できあがった！' : 'できた、次へ'}
      </button>
      {step > 0 && (
        <button
          type="button"
          onClick={() => setStep((value) => value - 1)}
          className="w-full py-2 font-bold text-ai underline"
        >
          前の手順に戻る
        </button>
      )}
    </div>
  )
}
