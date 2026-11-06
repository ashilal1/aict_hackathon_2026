import { useCallback, useState } from 'react'
import type { KozuyuData, Part, RecognizedFood } from '../data/types'
import type { Result, Row } from '../lib/buildResult'
import { Bubble, Card, GrannyFigure, Stepper, VerdictTag } from '../components/parts'
import { TriviaModal } from '../components/TriviaModal'
import { FoundFoods } from '../components/FoundFoods'
import { PhotoReader } from '../components/PhotoReader'
import { IngredientPicker } from '../components/IngredientPicker'

const SECTIONS: { id: Part['section']; label: string }[] = [
  { id: 'dashi', label: 'だし' },
  { id: 'gu', label: '具' },
]

type Props = {
  data: KozuyuData
  result: Result
  foods: RecognizedFood[]
  checked: Set<string>
  extras: Set<string>
  onToggle: (id: string) => void
  onToggleExtra: (name: string) => void
  onRemove: (ids: string[]) => void
  onRecognized: (foods: RecognizedFood[]) => void
  onNext: () => void
  onEditInput: () => void
}

export function RecommendationScreen({
  data,
  result,
  foods,
  checked,
  extras,
  onToggle,
  onToggleExtra,
  onRemove,
  onRecognized,
  onNext,
  onEditInput,
}: Props) {
  const [selectedRow, setSelectedRow] = useState<Row | null>(null)
  const closeModal = useCallback(() => setSelectedRow(null), [])

  return (
    <div className="flex flex-1 flex-col gap-3 px-4 pt-3 pb-8 md:mx-auto md:w-full md:max-w-4xl md:gap-5 md:pt-6">
      <Stepper current={2} />

      <div className="flex items-center gap-3 md:justify-center">
        <GrannyFigure />
        <Bubble>{result.template ? data.lines.recommendation : data.lines.noTemplate}</Bubble>
      </div>

      <PhotoReader onRecognized={onRecognized} mode="add" />

      <div className="grid gap-3 md:grid-cols-2 md:items-start md:gap-5">
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
          {extras.size > 0 && (
            <div className="mt-3">
              <h3 className="rounded-md bg-kinari px-2 py-1 text-[13px] font-bold text-sumi">
                自分で足すもの
              </h3>
              <p className="px-1 pt-2.5 font-bold">{[...extras].join('・')}</p>
              <p className="mt-1 px-1 text-xs text-sumi">
                本来のこづゆの材料ではねえから、味を見ながら使ってけさい
              </p>
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-3 md:gap-5">
          <Card title="もっとうまぐするには？">
            <p className="mb-3 text-sm text-sumi">気になるひと手間だけ、好きに取り入れてけさい。</p>
            <ul className="space-y-3">
              {data.enhancements.map((item) => {
                const on = checked.has(item.pantryId)
                return (
                  <li key={item.id} className="rounded-xl bg-kinari p-3.5">
                    <p className="font-bold">{item.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-sumi">{item.reason}</p>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => onToggle(item.pantryId)}
                      className={`mt-2.5 min-h-11 rounded-full border-2 border-ai px-4 text-sm font-bold ${
                        on ? 'bg-ai text-white' : 'bg-white'
                      }`}
                    >
                      {on ? '✓ 選んだぞ' : '取り入れるべ'}
                    </button>
                  </li>
                )
              })}
            </ul>
          </Card>

          <Card title="見つかった材料">
            <FoundFoods
              foods={foods}
              pantry={data.pantry}
              checked={checked}
              extras={extras}
              onToggle={onToggle}
              onToggleExtra={onToggleExtra}
            />
            <IngredientPicker pantry={data.pantry} checked={checked} onToggle={onToggle} />
          </Card>
        </div>
      </div>

      <div className="mt-2 grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={onNext}
          className="min-h-14 w-full rounded-full bg-shu text-[17px] font-bold text-white shadow-lg"
        >
          今日のこづゆを見るべ
        </button>
        <button
          type="button"
          onClick={onEditInput}
          className="min-h-12 w-full rounded-full border-2 border-ai font-bold md:min-h-14"
        >
          材料を選び直すべ
        </button>
      </div>

      {selectedRow && <TriviaModal row={selectedRow} onClose={closeModal} />}
    </div>
  )
}
