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

  // 写真で見つかった材料は、いまのチェックに足す（外すのは使う人が手で）
  const addRecognized = (ids: string[]) => setChecked((prev) => new Set([...prev, ...ids]))

  const showResult = useCallback(() => setScreen('result'), [])

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-kinari shadow-xl md:my-6 md:min-h-[calc(100dvh-3rem)] md:max-w-5xl md:overflow-hidden md:rounded-3xl">
      <div className="aizu-momen h-3 shrink-0 md:h-4" aria-hidden />
      <header className="hidden items-center justify-between px-10 pt-5 md:flex">
        <p className="text-xl font-bold">こづゆばあちゃんの台所</p>
        <p className="text-sm text-sumi">代用でここまで。残りは、会津で。</p>
      </header>
      {screen === 'input' && (
        <InputScreen
          data={data}
          checked={checked}
          onToggle={toggle}
          onRecognized={addRecognized}
          onSubmit={() => setScreen('judging')}
        />
      )}
      {screen === 'judging' && <JudgingScreen line={data.lines.judging} onDone={showResult} />}
      {screen === 'result' && (
        <ResultScreen data={data} result={result} onRestart={() => setScreen('input')} />
      )}
    </div>
  )
}
