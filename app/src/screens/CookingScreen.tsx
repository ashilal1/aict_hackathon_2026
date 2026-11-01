import { useState } from 'react'
import type { Enhancement, Template } from '../data/types'
import { supplementalEnhancements } from '../lib/cookingStyle'
import { Bubble, Card, GrannyFace, StepHeader } from '../components/parts'

type Props = {
  template: Template
  checked: Set<string>
  enhancements: Enhancement[]
  onBack: () => void
  onComplete: () => void
}

export function CookingScreen({ template, checked, enhancements, onBack, onComplete }: Props) {
  const [step, setStep] = useState(0)
  const additionalInstructions = supplementalEnhancements(checked, enhancements, template.requires)
  const currentStep = template.steps[step]
  const isLast = step === template.steps.length - 1

  return (
    <div className="flex flex-1 flex-col gap-5 px-4 pt-5 pb-8 md:px-10 md:pt-8">
      <StepHeader step={3} title="調理手順" />
      <div className="flex items-center gap-4 md:justify-center">
        <GrannyFace size={64} />
        <Bubble>{isLast ? 'もう少しだ。焦らず仕上げっせ' : '一つずつ進めれば大丈夫だ'}</Bubble>
      </div>

      <Card>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-bold">{template.label}</h2>
          <span className="text-sm text-sumi">
            {template.servings}・{template.time}
          </span>
        </div>
      </Card>

      {additionalInstructions.length > 0 && (
        <Card title="追加した材料の使い方">
          <ul className="space-y-3">
            {additionalInstructions.map((item) => (
              <li key={item.id} className="rounded-xl bg-kinari p-3">
                <h3 className="font-bold">{item.title}</h3>
                <p className="mt-1 leading-relaxed text-sumi">{item.preparation}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between text-sm font-bold">
          <span>基本の作り方</span>
          <span>
            {step + 1} / {template.steps.length}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="調理手順の進み具合"
          aria-valuemin={1}
          aria-valuemax={template.steps.length}
          aria-valuenow={step + 1}
          aria-valuetext={`${template.steps.length}手順中${step + 1}番目`}
          className="h-2 overflow-hidden rounded-full bg-stone-200"
        >
          <div
            className="h-full rounded-full bg-shu transition-all"
            style={{ width: `${((step + 1) / template.steps.length) * 100}%` }}
          />
        </div>
      </div>

      <Card>
        <p className="text-sm font-bold text-shu">いまやること</p>
        <p className="mt-3 text-2xl leading-relaxed font-bold" aria-live="polite" aria-atomic="true">
          {currentStep}
        </p>
      </Card>

      <button
        type="button"
        onClick={() => (isLast ? onComplete() : setStep((value) => value + 1))}
        className="mt-auto min-h-12 w-full rounded-full bg-shu py-4 text-lg font-bold text-white shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-kincha/50"
      >
        {isLast ? 'できあがった！' : 'できた、次へ'}
      </button>
      <button
        type="button"
        onClick={() => (step === 0 ? onBack() : setStep((value) => value - 1))}
        className="min-h-11 w-full rounded-full border-2 border-ai py-3 font-bold text-ai focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-kincha/50"
      >
        {step === 0 ? '完成内容へ戻る' : '前の手順に戻る'}
      </button>
    </div>
  )
}
