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
    <div className="flex flex-1 flex-col gap-3.5 px-4 pt-3 pb-8 md:mx-auto md:w-full md:max-w-xl md:gap-5 md:pt-6">
      <div className="flex items-center gap-3 md:justify-center">
        <GrannyFace size={52} />
        <Bubble>{isLast ? 'もう少しだ。焦らず仕上げっせ' : '一つずつ進めれば大丈夫だ'}</Bubble>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-sm font-bold">
          <span>{effort.shortLabel}</span>
          <span>
            {step + 1} / {steps.length}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="手順の進み具合"
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={step + 1}
          className="h-2.5 overflow-hidden rounded-full bg-line"
        >
          <div
            className="h-full rounded-full bg-shu transition-all"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-sumi">手順は、ひとつずつ大きく表示します</p>
      </div>

      <Card>
        <p className="text-[13px] font-bold text-shu">いまやること</p>
        <p className="mt-2.5 text-2xl leading-relaxed font-bold">{steps[step]}</p>
      </Card>

      <Card title="ばあちゃんの豆知識">
        <p className="text-sm leading-relaxed text-sumi">{currentTip}</p>
      </Card>

      <button
        type="button"
        onClick={() => (isLast ? onComplete() : setStep((value) => value + 1))}
        className="mt-auto min-h-14 w-full rounded-full bg-shu text-lg font-bold text-white shadow-lg"
      >
        {isLast ? 'できあがった！' : 'できた、次へ'}
      </button>
      {step > 0 && (
        <button
          type="button"
          onClick={() => setStep((value) => value - 1)}
          className="min-h-12 w-full text-[15px] font-bold underline"
        >
          前の手順に戻る
        </button>
      )}
    </div>
  )
}
