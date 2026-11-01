import { useEffect, useMemo, useState } from 'react'
import kozuyu from './data/kozuyu.json'
import type { KozuyuData } from './data/types'
import { buildResult } from './lib/buildResult'
import { styleById, type CookingStyleId } from './lib/cookingStyle'
import { CookingStyleScreen } from './screens/CookingStyleScreen'
import { InputScreen } from './screens/InputScreen'
import { ResultScreen } from './screens/ResultScreen'
import { CookingScreen } from './screens/CookingScreen'
import { CompletionScreen } from './screens/CompletionScreen'

const data = kozuyu as KozuyuData
type Screen = 'style' | 'ingredients' | 'result' | 'cooking' | 'aizu'

export default function App() {
  const [screen, setScreen] = useState<Screen>('style')
  const [styleId, setStyleId] = useState<CookingStyleId | null>(null)
  const [checked, setChecked] = useState<Set<string>>(() => new Set())
  const style = styleId ? styleById(styleId) : null
  const result = useMemo(() => buildResult(checked, data), [checked])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen])

  const chooseStyle = (selected: CookingStyleId) => {
    const nextStyle = styleById(selected)
    if (selected !== styleId) setChecked(new Set(nextStyle.recommendedIds))
    setStyleId(selected)
    setScreen('ingredients')
  }

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const addRecognized = (ids: string[]) => setChecked((prev) => new Set([...prev, ...ids]))
  const restart = () => {
    setScreen('style')
    setStyleId(null)
    setChecked(new Set())
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-kinari shadow-xl md:my-6 md:min-h-[calc(100dvh-3rem)] md:max-w-5xl md:overflow-hidden md:rounded-3xl">
      <div className="aizu-momen h-3 shrink-0 md:h-4" aria-hidden />
      <header className="hidden items-center justify-between px-10 pt-5 md:flex">
        <p className="text-xl font-bold">こづゆばあちゃんの台所</p>
        <p className="text-sm text-sumi">自分の一杯から、会津の一杯へ。</p>
      </header>
      {screen === 'style' && <CookingStyleScreen initial={styleId} onSubmit={chooseStyle} />}
      {screen === 'ingredients' && style && (
        <InputScreen
          data={data}
          style={style}
          checked={checked}
          canContinue={result.template !== null}
          onToggle={toggle}
          onRecognized={addRecognized}
          onBack={() => setScreen('style')}
          onSubmit={() => setScreen('result')}
        />
      )}
      {screen === 'result' && style && (
        <ResultScreen
          data={data}
          result={result}
          style={style}
          checked={checked}
          onStartCooking={() => setScreen('cooking')}
          onBack={() => setScreen('ingredients')}
        />
      )}
      {screen === 'cooking' && result.template && (
        <CookingScreen
          template={result.template}
          checked={checked}
          enhancements={data.enhancements}
          onBack={() => setScreen('result')}
          onComplete={() => setScreen('aizu')}
        />
      )}
      {screen === 'aizu' && <CompletionScreen data={data} result={result} onRestart={restart} />}
    </div>
  )
}
