import { useCallback, useEffect, useMemo, useState } from 'react'
import kozuyu from './data/kozuyu.json'
import type { KozuyuData } from './data/types'
import { buildResult } from './lib/buildResult'
import { preloadGranny } from './lib/granny'
import { InputScreen } from './screens/InputScreen'
import { JudgingScreen } from './screens/JudgingScreen'
import { ResultScreen } from './screens/ResultScreen'

const data = kozuyu as KozuyuData

type Screen = 'input' | 'judging' | 'result'

export default function App() {
  const [screen, setScreen] = useState<Screen>('input')
  const [checked, setChecked] = useState<Set<string>>(() => new Set())
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

  const showResult = useCallback(() => setScreen('result'), [])

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-kinari shadow-xl">
      <div className="aizu-momen h-3 shrink-0" aria-hidden />
      {screen === 'input' && (
        <InputScreen data={data} checked={checked} onToggle={toggle} onSubmit={() => setScreen('judging')} />
      )}
      {screen === 'judging' && <JudgingScreen line={data.lines.judging} onDone={showResult} />}
      {screen === 'result' && (
        <ResultScreen data={data} result={result} onRestart={() => setScreen('input')} />
      )}
    </div>
  )
}
