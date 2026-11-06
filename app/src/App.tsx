import { useCallback, useEffect, useMemo, useState } from 'react'
import kozuyu from './data/kozuyu.json'
import type { KozuyuData, RecognizedFood } from './data/types'
import { buildResult } from './lib/buildResult'
import { loadSpinImages } from './lib/granny'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { CookingStyleScreen } from './screens/CookingStyleScreen'
import { InputScreen } from './screens/InputScreen'
import { JudgingScreen } from './screens/JudgingScreen'
import { ResultScreen } from './screens/ResultScreen'
import { RecommendationScreen } from './screens/RecommendationScreen'
import { CookingScreen } from './screens/CookingScreen'
import { CompletionScreen } from './screens/CompletionScreen'
import { EvaluationScreen } from './screens/EvaluationScreen'
import { effortById, effortFor } from './lib/effort'
import type { CookingStyleId } from './lib/cookingStyle'

const data = kozuyu as KozuyuData

type Screen =
  | 'onboarding'
  | 'style'
  | 'input'
  | 'ingredientJudging'
  | 'recommendation'
  | 'result'
  | 'cooking'
  | 'completion'
  | 'evaluation'

export default function App() {
  const [screen, setScreen] = useState<Screen>('onboarding')
  const [style, setStyle] = useState<CookingStyleId | null>(null)
  const [checked, setChecked] = useState<Set<string>>(() => new Set())
  // 写真で見つかった食材のすべてと、そのうち pantry に無いもので使うと選んだ名前
  const [foods, setFoods] = useState<RecognizedFood[]>([])
  const [extras, setExtras] = useState<Set<string>>(() => new Set())
  const result = useMemo(() => buildResult(checked, data), [checked])
  const effort = effortById(effortFor(style, checked))

  useEffect(() => {
    // 判定シーンをすぐ始められるように、入力画面のうちに読み込んでおく
    void loadSpinImages()
  }, [])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen])

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const toggleExtra = (name: string) =>
    setExtras((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })

  // 写真で見つかった食材は一覧に足すだけ。使うかどうかは使う人が選ぶ
  const addFoods = (found: RecognizedFood[]) =>
    setFoods((prev) => [...prev, ...found.filter((food) => !prev.some((p) => p.name === food.name))])
  const remove = (ids: string[]) => setChecked((prev) => new Set([...prev].filter((id) => !ids.includes(id))))

  const showRecommendation = useCallback(() => setScreen('recommendation'), [])
  const restart = () => setScreen('style')

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-kinari shadow-xl md:my-6 md:min-h-[calc(100dvh-3rem)] md:max-w-5xl md:overflow-hidden md:rounded-3xl md:shadow-[0_0_0_2px_#b8862b,0_0_0_6px_#a82a1f,0_0_0_8px_#b8862b,0_16px_48px_rgb(0_0_0/60%)]">
      <div className="aizu-momen h-3 shrink-0 md:h-4" aria-hidden />
      <header className="urushi-band flex flex-col gap-0.5 border-b-2 border-kincha px-4 py-3 md:flex-row md:items-center md:justify-between md:px-10 md:py-4">
        <p className="text-[17px] font-bold text-kin md:text-xl">こづゆばあちゃんの台所</p>
        <p className={`text-xs text-kin/90 md:block md:text-sm ${screen === 'input' ? '' : 'hidden'}`}>
          代用でここまで。残りは、会津で。
        </p>
      </header>
      {screen === 'onboarding' && <OnboardingScreen data={data} onDone={() => setScreen('style')} />}
      {screen === 'style' && (
        <CookingStyleScreen
          initial={style}
          onSubmit={(selected) => {
            setStyle(selected)
            setScreen('input')
          }}
        />
      )}
      {screen === 'input' && (
        <InputScreen
          data={data}
          foods={foods}
          checked={checked}
          extras={extras}
          onToggle={toggle}
          onToggleExtra={toggleExtra}
          onRecognized={addFoods}
          onSubmit={() => setScreen('ingredientJudging')}
        />
      )}
      {screen === 'ingredientJudging' && (
        <JudgingScreen
          line={data.lines.judging}
          labels={[
            ...data.pantry.filter((item) => checked.has(item.id)).map((item) => item.label),
            ...extras,
          ]}
          onDone={showRecommendation}
        />
      )}
      {screen === 'recommendation' && (
        <RecommendationScreen
          data={data}
          result={result}
          foods={foods}
          checked={checked}
          extras={extras}
          onToggle={toggle}
          onToggleExtra={toggleExtra}
          onRemove={remove}
          onRecognized={addFoods}
          onNext={() => setScreen('result')}
          onEditInput={() => setScreen('input')}
        />
      )}
      {screen === 'result' && (
        <ResultScreen
          data={data}
          result={result}
          checked={checked}
          extras={extras}
          effort={effort}
          onStartCooking={() => setScreen('cooking')}
          onRestart={() => setScreen('input')}
        />
      )}
      {screen === 'cooking' && result.template && (
        <CookingScreen
          template={result.template}
          checked={checked}
          extras={extras}
          effort={effort}
          tips={data.lines.cookingTips}
          onComplete={() => setScreen('completion')}
        />
      )}
      {screen === 'completion' && (
        <CompletionScreen
          data={data}
          result={result}
          onEvaluate={() => setScreen('evaluation')}
          onRestart={restart}
        />
      )}
      {screen === 'evaluation' && <EvaluationScreen data={data} onRestart={restart} />}
    </div>
  )
}
