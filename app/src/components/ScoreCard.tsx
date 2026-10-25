import { useEffect, useState } from 'react'
import { SCORE_MAX, type Row, type Score } from '../lib/buildResult'
import { Card } from './parts'

const COUNT_UP_MS = 900

// 0 から点数まで数え上げる（動きを減らす設定の端末では、すぐに出す）
function useCountUp(target: number) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [value, setValue] = useState(reduceMotion ? target : 0)
  useEffect(() => {
    if (reduceMotion) return
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min((now - start) / COUNT_UP_MS, 1)
      setValue(Math.round(target * (1 - (1 - t) ** 3)))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, reduceMotion])
  return value
}

type Props = {
  score: Score
  rows: Row[]
}

export function ScoreCard({ score, rows }: Props) {
  const shown = useCountUp(score.value)
  const rest = SCORE_MAX - score.value

  return (
    <Card className="text-center">
      <p className="text-sm font-bold text-sumi">本物との近さ</p>
      <p className="mt-1 font-bold text-shu" aria-label={`${score.value} 点`}>
        <span className="text-6xl tabular-nums md:text-7xl">{shown}</span>
        <span className="ml-1 text-2xl">点</span>
        <span className="ml-1 text-base text-sumi">/ {SCORE_MAX}</span>
      </p>

      <div className="mx-auto mt-3 h-3 max-w-md overflow-hidden rounded-full bg-stone-200">
        <div className="h-full rounded-full bg-shu" style={{ width: `${(shown / SCORE_MAX) * 100}%` }} />
      </div>

      <p className="mt-3">
        {score.kind === 'measured' ? (
          <span className="rounded-md bg-ai px-2 py-0.5 text-xs font-bold text-white">
            学生 {score.people} 人の食べ比べ（{score.date}）
          </span>
        ) : (
          <span className="rounded-md bg-kincha px-2 py-0.5 text-xs font-bold text-white">
            見込み（食べ比べ前の仮の点数）
          </span>
        )}
      </p>

      {rest > 0 && <p className="mt-3 text-lg font-bold">足りない {rest} 点ぶんは、会津の本物で。</p>}

      <details className="mx-auto mt-4 max-w-xl text-left text-sm">
        <summary className="cursor-pointer text-center font-bold text-ai underline">点数の出し方</summary>
        {score.kind === 'measured' ? (
          <p className="mt-3 leading-relaxed text-sumi">
            この配合を、中身を伏せて本物と食べ比べ、「どれくらい違うか」を
            0（同じ）〜10（まったく違う）で付けてもらいました。点数は 100 −（平均 × 10）です。
          </p>
        ) : (
          <>
            <p className="mt-3 leading-relaxed text-sumi">
              材料ごとに「こづゆらしさ」の配点（合わせて {SCORE_MAX}{' '}
              点）を決め、本物なら配点まるごと、代わりならその近さ（本物 =
              1）を掛けた点を足しています。いまの配点と近さは、チームの試作前の仮の値です。食べ比べをしたら、測った点数に置き換えます。
            </p>
            <table className="mt-3 w-full">
              <thead>
                <tr className="border-b border-stone-200 text-xs text-sumi">
                  <th className="py-1 text-left font-bold whitespace-nowrap">材料</th>
                  <th className="py-1 text-left font-bold">今回</th>
                  <th className="py-1 text-right font-bold whitespace-nowrap">点 / 配点</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rows.map((row) => (
                  <tr key={row.partId}>
                    <td className="py-1.5 pr-2 font-bold whitespace-nowrap">{row.original}</td>
                    <td className="py-1.5">{row.verdict === 'real' ? '本物' : row.text}</td>
                    <td className="py-1.5 pl-2 text-right whitespace-nowrap tabular-nums">
                      {row.points} / {row.weight}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-stone-200 font-bold">
                  <td className="py-1.5" colSpan={2}>
                    合計
                  </td>
                  <td className="py-1.5 text-right tabular-nums">
                    {score.value} / {SCORE_MAX}
                  </td>
                </tr>
              </tfoot>
            </table>
          </>
        )}
      </details>

      <p className="mt-4 text-xs text-sumi">
        点数は「基準のこづゆとの近さ」です。家ごとに違うこづゆの、どれが正しいかを決めるものではありません。
      </p>
    </Card>
  )
}
