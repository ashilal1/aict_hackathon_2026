import { useCallback, useState } from 'react'
import type { KozuyuData, Part } from '../data/types'
import type { Result, Row } from '../lib/buildResult'
import { Bubble, Card, DraftNote, GrannyFace, VerdictTag } from '../components/parts'
import { ScoreCard } from '../components/ScoreCard'
import { TriviaModal } from '../components/TriviaModal'

const SECTIONS: { id: Part['section']; label: string }[] = [
  { id: 'dashi', label: 'だし' },
  { id: 'gu', label: '具' },
]

type Props = {
  data: KozuyuData
  result: Result
  onNext: () => void
}

export function RecommendationScreen({ data, result, onNext }: Props) {
  const [selectedRow, setSelectedRow] = useState<Row | null>(null)
  const closeModal = useCallback(() => setSelectedRow(null), [])

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-5 pb-8 md:gap-6 md:px-10 md:pt-6">
      <div className="flex items-center gap-4 md:justify-center">
        <GrannyFace size={64} />
        <Bubble>{result.template ? result.score.comment : data.lines.noTemplate}</Bubble>
      </div>

      <ScoreCard score={result.score} rows={result.rows} />

      <Card title="本物と、今日の代わり">
        <p className="mb-3 text-sm leading-relaxed text-sumi">
          「豆知識」を押すと、味や食感の違いと使うときのコツが見られます。
        </p>
        {SECTIONS.map((section) => (
          <div key={section.id} className="mb-3 last:mb-0">
            <h3 className="border-b border-stone-200 pb-1 text-sm font-bold text-sumi">{section.label}</h3>
            <ul className="divide-y divide-stone-100">
              {result.rows
                .filter((row) => row.section === section.id)
                .map((row) => (
                  <li key={row.partId} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold">
                          {row.original}
                          {row.verdict !== 'real' && (
                            <>
                              <span className="mx-1.5 text-sumi">→</span>
                              {row.text}
                            </>
                          )}
                        </p>
                        {row.note && <p className="mt-1 text-xs text-sumi">{row.note}</p>}
                      </div>
                      <VerdictTag verdict={row.verdict} />
                    </div>
                    {row.trivia && (
                      <button
                        type="button"
                        onClick={() => setSelectedRow(row)}
                        className="mt-2 rounded-full border border-ai px-3 py-1 text-sm font-bold text-ai"
                      >
                        豆知識を見る
                      </button>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </Card>

      {data.draft && <DraftNote />}

      <button
        type="button"
        onClick={onNext}
        className="w-full rounded-full bg-shu py-4 text-lg font-bold text-white shadow-lg"
      >
        作り方の手軽さを選ぶ
      </button>

      {selectedRow && <TriviaModal row={selectedRow} onClose={closeModal} />}
    </div>
  )
}
