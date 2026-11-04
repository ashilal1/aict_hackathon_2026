import { useCallback, useState } from 'react'
import type { KozuyuData, Part } from '../data/types'
import type { Result, Row } from '../lib/buildResult'
import { Bubble, Card, DraftNote, GrannyFace, Stepper, VerdictTag } from '../components/parts'
import { TriviaModal } from '../components/TriviaModal'
import { PhotoReader } from '../components/PhotoReader'
import { IngredientPicker } from '../components/IngredientPicker'

const SECTIONS: { id: Part['section']; label: string }[] = [
  { id: 'dashi', label: 'だし' },
  { id: 'gu', label: '具' },
]

type Props = {
  data: KozuyuData
  result: Result
  checked: Set<string>
  onToggle: (id: string) => void
  onRemove: (ids: string[]) => void
  onRecognized: (ids: string[]) => void
  onNext: () => void
  onEditInput: () => void
}

export function RecommendationScreen({
  data,
  result,
  checked,
  onToggle,
  onRemove,
  onRecognized,
  onNext,
  onEditInput,
}: Props) {
  const [selectedRow, setSelectedRow] = useState<Row | null>(null)
  const closeModal = useCallback(() => setSelectedRow(null), [])

  return (
    <div className="flex flex-1 flex-col gap-3 px-4 pt-3 pb-8 md:mx-auto md:w-full md:max-w-xl md:gap-5 md:pt-6">
      <Stepper current={2} />

      <div className="flex items-center gap-3 md:justify-center">
        <GrannyFace size={52} />
        <Bubble>{result.template ? data.lines.recommendation : data.lines.noTemplate}</Bubble>
      </div>

      <PhotoReader pantry={data.pantry} onRecognized={onRecognized} mode="add" />

      <Card title="本物と、今日の代わり">
        {SECTIONS.map((section) => (
          <div key={section.id} className="mb-3 last:mb-0">
            <h3 className="rounded-md bg-kinari px-2 py-1 text-[13px] font-bold text-sumi">
              {section.label}
            </h3>
            <ul className="divide-y divide-[#f0ebe0]">
              {result.rows
                .filter((row) => row.section === section.id)
                .map((row) => (
                  <li key={row.partId} className="px-1 py-2.5">
                    <p className="text-xs text-sumi">本物</p>
                    <p className="font-bold">{row.original}</p>
                    {row.verdict !== 'real' && (
                      <>
                        <p className="mt-1.5 text-xs text-sumi">今日の代わり</p>
                        <p className={`font-bold ${row.usedIds.length === 0 ? 'text-sumi' : ''}`}>
                          {row.text}
                        </p>
                      </>
                    )}
                    {row.note && <p className="mt-1 text-xs text-sumi">{row.note}</p>}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <VerdictTag verdict={row.verdict} />
                        {row.trivia && (
                          <button
                            type="button"
                            onClick={() => setSelectedRow(row)}
                            className="rounded-full border-[1.5px] border-ai px-2.5 py-1 text-xs font-bold"
                          >
                            豆知識
                          </button>
                        )}
                      </div>
                      {row.usedIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => onRemove(row.usedIds)}
                          aria-label={`${row.original}の行に使った材料を外す`}
                          className="h-9 w-9 shrink-0 rounded-lg border-[1.5px] border-line text-base text-sumi"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </Card>

      <Card title="材料を足す">
        <IngredientPicker pantry={data.pantry} checked={checked} onToggle={onToggle} />
      </Card>

      {data.draft && <DraftNote />}

      <button
        type="button"
        onClick={onNext}
        className="mt-2 min-h-14 w-full rounded-full bg-shu text-[17px] font-bold text-white shadow-lg"
      >
        作り方の手軽さを選ぶ
      </button>
      <button
        type="button"
        onClick={onEditInput}
        className="min-h-12 w-full rounded-full border-2 border-ai font-bold"
      >
        材料を選び直す
      </button>

      {selectedRow && <TriviaModal row={selectedRow} onClose={closeModal} />}
    </div>
  )
}
