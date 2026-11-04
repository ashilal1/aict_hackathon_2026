import { useState } from 'react'
import type { KozuyuData } from '../data/types'
import { Bubble, Card, DraftNote, GrannyFace } from '../components/parts'

type Props = {
  data: KozuyuData
  onRestart: () => void
}

// 作った人が食べて、項目ごとに ⚪︎／❌ を付ける。⚪︎ の数が点数（docs/architecture.md 3 章）
// 結果はこの端末の画面に出すだけで、保存も送信もしない
export function EvaluationScreen({ data, onRestart }: Props) {
  const { aspects } = data.evaluation
  const items = aspects.flatMap((aspect) => aspect.items)
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [shown, setShown] = useState(false)

  const answered = items.filter((item) => item.id in answers).length
  const yes = items.filter((item) => answers[item.id]).length
  const allAnswered = answered === items.length

  const answer = (id: string, value: boolean) => setAnswers((prev) => ({ ...prev, [id]: value }))

  return (
    <div className="flex flex-1 flex-col gap-3 px-4 pt-3 pb-8 md:mx-auto md:w-full md:max-w-xl md:gap-5 md:pt-6">
      <div className="flex items-center gap-3 md:justify-center">
        <GrannyFace size={52} />
        <Bubble>{data.lines.evaluation}</Bubble>
      </div>
      <div>
        <p className="text-[13px] font-bold text-shu">食べた人の評価</p>
        <h1 className="mt-0.5 text-[22px] font-bold">今日のこづゆ、どうでしたか</h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-sumi">
          正解はありません。感じたものに ⚪︎、感じなかったものに ❌
          を付けてください。本物を食べたことがなくても大丈夫です。
        </p>
      </div>

      {aspects.map((aspect) => (
        <Card key={aspect.id} title={aspect.label}>
          <ul>
            {aspect.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 border-t border-[#f0ebe0] py-2 first:border-t-0"
              >
                <span className="text-[15px] font-bold text-sumi">{item.text}</span>
                <span role="group" aria-label={`${item.text}の評価`} className="flex shrink-0 gap-1.5">
                  {[true, false].map((value) => {
                    const on = answers[item.id] === value
                    return (
                      <button
                        key={String(value)}
                        type="button"
                        aria-pressed={on}
                        aria-label={value ? '感じた（⚪︎）' : '感じなかった（❌）'}
                        onClick={() => answer(item.id, value)}
                        className={`h-11 w-11 rounded-[10px] border-2 text-lg transition-colors ${
                          on
                            ? value
                              ? 'border-shu bg-[#fde8e4]'
                              : 'border-ai bg-sand'
                            : 'border-line bg-white'
                        } ${item.id in answers && !on ? 'opacity-50' : ''}`}
                      >
                        {/* ⚪︎ の文字は細く小さく出るので、太い ◯ で描く */}
                        {value ? <span className="text-xl font-bold text-shu">◯</span> : '❌'}
                      </button>
                    )
                  })}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      <DraftNote>観点と項目の中身は、チームでまだ決めていません。ここは空欄のままです</DraftNote>

      {shown ? (
        <section className="rounded-2xl border-2 border-shu bg-white p-4 text-center shadow-sm" role="status">
          <p className="text-sm font-bold text-sumi">あなたが食べて ⚪︎ を付けた数</p>
          <p className="mt-1 text-shu">
            <span className="text-5xl font-bold">{yes}</span>
            <span className="ml-1 text-lg font-bold text-sumi">/ {items.length}</span>
          </p>
          <p className="mt-2 text-xs text-sumi">結果はこの画面に出すだけで、どこにも送りません</p>
        </section>
      ) : (
        <div className="mt-auto pt-2">
          <p className="mb-2.5 text-center text-sm font-bold">
            ⚪︎ の数：{yes} / 全 {items.length} 項目
          </p>
          <button
            type="button"
            onClick={() => setShown(true)}
            disabled={!allAnswered}
            className="min-h-14 w-full rounded-full bg-shu text-[17px] font-bold text-white shadow-lg transition-opacity disabled:opacity-40"
          >
            {allAnswered ? '結果を見る' : `あと ${items.length - answered} 項目`}
          </button>
        </div>
      )}

      {shown && (
        <>
          <p className="text-center font-bold">代用でここまで。残りは、会津で。</p>
          <button
            type="button"
            onClick={onRestart}
            className="min-h-12 w-full rounded-full border-2 border-ai font-bold"
          >
            もう一度作る
          </button>
        </>
      )}
    </div>
  )
}
