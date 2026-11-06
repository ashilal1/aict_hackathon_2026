import { useState } from 'react'
import type { Template } from '../data/types'
import { cookingStepsFor, withPreparation, type EffortLevel } from '../lib/effort'
import { BekoProgress, Bubble, Card, GrannyFigure } from '../components/parts'

type Props = {
  template: Template
  checked: Set<string>
  effort: EffortLevel
  tips: string[]
  onComplete: () => void
}

export function CookingScreen({ template, checked, effort, tips, onComplete }: Props) {
  const [step, setStep] = useState(0)
  const steps = cookingStepsFor(withPreparation(template.steps, checked), effort)
  const currentTip = tips[step % tips.length]
  const isLast = step === steps.length - 1

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pt-3 pb-8 md:mx-auto md:w-full md:max-w-4xl md:gap-5 md:pt-6">
      <div className="flex items-center gap-3 md:justify-center">
        <GrannyFigure />
        <Bubble>{isLast ? 'もう少しだ。焦らず仕上げっせ' : '一つずつ進めりゃ大丈夫だ'}</Bubble>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-sm font-bold">
          <span>{effort.shortLabel}</span>
          <span>
            {step + 1} / {steps.length}
          </span>
        </div>
        <BekoProgress value={(step + 1) / steps.length} label="手順の進み具合" />
        <p className="mt-1.5 text-xs text-sumi">手順は、ひとつずつ大きく出すからな</p>
      </div>

      <div className="grid gap-3.5 md:grid-cols-3 md:gap-5">
        <Card className="md:col-span-2">
          <p className="text-[13px] font-bold text-shu">いまやること</p>
          <p className="mt-2.5 text-2xl leading-relaxed font-bold">{steps[step]}</p>
        </Card>

        <Card title="こづゆばあちゃんの豆知識">
          <p className="text-sm leading-relaxed text-sumi">{currentTip}</p>
        </Card>
      </div>

      <button
        type="button"
        onClick={() => (isLast ? onComplete() : setStep((value) => value + 1))}
        className="mt-auto min-h-14 w-full rounded-full bg-shu text-lg font-bold text-white shadow-lg"
      >
        {isLast ? 'できたぞ！' : 'できた、次さ行くべ'}
      </button>
      {step > 0 && (
        <button
          type="button"
          onClick={() => setStep((value) => value - 1)}
          className="min-h-12 w-full text-[15px] font-bold underline"
        >
          前の手順さ戻るべ
        </button>
      )}
    </div>
  )
}
