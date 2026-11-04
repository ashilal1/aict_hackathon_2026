import { useCallback, useEffect, useMemo, useState } from 'react'
import kozuyu from './data/kozuyu.json'
import type { KozuyuData } from './data/types'
import { buildResult } from './lib/buildResult'
import { preloadGranny } from './lib/granny'
import { IntroScreen } from './screens/IntroScreen'
import { InputScreen } from './screens/InputScreen'
import { JudgingScreen } from './screens/JudgingScreen'
import { ResultScreen } from './screens/ResultScreen'
import { RecommendationScreen } from './screens/RecommendationScreen'
import { EffortScreen } from './screens/EffortScreen'
import { CookingScreen } from './screens/CookingScreen'
import { CompletionScreen } from './screens/CompletionScreen'
import { EvaluationScreen } from './screens/EvaluationScreen'
import { effortById, type EffortId } from './lib/effort'

const data = kozuyu as KozuyuData

type Screen =
  | 'intro'
  | 'input'
  | 'ingredientJudging'
  | 'recommendation'
  | 'effort'
  | 'recipeJudging'
  | 'result'
  | 'cooking'
  | 'completion'
  | 'evaluation'

export default function App() {
  const [screen, setScreen] = useState<Screen>('intro')
  const [checked, setChecked] = useState<Set<string>>(() => new Set())
  const [effort, setEffort] = useState<EffortId>('standard')
  const result = useMemo(() => buildResult(checked, data), [checked])

  useEffect(() => {
    preloadGranny()
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

  // 写真で見つかった材料は、いまのチェックに足す（外すのは使う人が手で）
  const addRecognized = (ids: string[]) => setChecked((prev) => new Set([...prev, ...ids]))
  const remove = (ids: string[]) => setChecked((prev) => new Set([...prev].filter((id) => !ids.includes(id))))

  const showRecommendation = useCallback(() => setScreen('recommendation'), [])
  const showResult = useCallback(() => setScreen('result'), [])
  const restart = () => {
    setScreen('input')
    setEffort('standard')
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-kinari shadow-xl md:my-6 md:min-h-[calc(100dvh-3rem)] md:max-w-5xl md:overflow-hidden md:rounded-3xl">
      <div className="aizu-momen h-3 shrink-0 md:h-4" aria-hidden />
      {screen === 'intro' ? (
        <header className="hidden px-10 pt-5 md:block">
          <p className="text-xl font-bold">こづゆばあちゃんの台所</p>
        </header>
      ) : (
        <header className="flex flex-col gap-0.5 px-4 pt-3.5 md:flex-row md:items-center md:justify-between md:px-10 md:pt-5">
          <p className="text-[17px] font-bold md:text-xl">こづゆばあちゃんの台所</p>
          <p className={`text-xs text-sumi md:block md:text-sm ${screen === 'input' ? '' : 'hidden'}`}>
            代用でここまで。残りは、会津で。
          </p>
        </header>
      )}
      {screen === 'intro' && <IntroScreen intro={data.intro} onStart={() => setScreen('input')} />}
      {screen === 'input' && (
        <InputScreen
          data={data}
          checked={checked}
          onToggle={toggle}
          onRecognized={addRecognized}
          onSubmit={() => setScreen('ingredientJudging')}
        />
      )}
      {screen === 'ingredientJudging' && (
        <JudgingScreen
          line={data.lines.judging}
          labels={data.pantry.filter((item) => checked.has(item.id)).map((item) => item.label)}
          onDone={showRecommendation}
        />
      )}
      {screen === 'recommendation' && (
        <RecommendationScreen
          data={data}
          result={result}
          checked={checked}
          onToggle={toggle}
          onRemove={remove}
          onRecognized={addRecognized}
          onNext={() => setScreen('effort')}
          onEditInput={() => setScreen('input')}
        />
      )}
      {screen === 'effort' && (
        <EffortScreen
          initial={effort}
          onSubmit={(selected) => {
            setEffort(selected)
            setScreen('recipeJudging')
          }}
        />
      )}
      {screen === 'recipeJudging' && <JudgingScreen line={data.lines.recipeJudging} onDone={showResult} />}
      {screen === 'result' && (
        <ResultScreen
          data={data}
          result={result}
          effort={effortById(effort)}
          onStartCooking={() => setScreen('cooking')}
          onRestart={restart}
        />
      )}
      {screen === 'cooking' && result.template && (
        <CookingScreen
          template={result.template}
          effort={effortById(effort)}
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
