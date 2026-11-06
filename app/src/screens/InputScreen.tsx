import { useState } from 'react'
import type { KozuyuData } from '../data/types'
import { Bubble, Card, GrannyFigure, Stepper } from '../components/parts'
import { PhotoReader } from '../components/PhotoReader'
import { IngredientPicker } from '../components/IngredientPicker'

type Props = {
  data: KozuyuData
  checked: Set<string>
  onToggle: (id: string) => void
  onRecognized: (ids: string[]) => void
  onSubmit: () => void
}

export function InputScreen({ data, checked, onToggle, onRecognized, onSubmit }: Props) {
  const selected = data.pantry.filter((item) => checked.has(item.id))
  const [photoRead, setPhotoRead] = useState(false)

  // 本物のこづゆに使う材料のうち、まだ選ばれていないもの。見て思い出してもらう
  const realIds = new Set(data.parts.map((part) => part.realId))
  const notFound = data.pantry.filter((item) => realIds.has(item.id) && !checked.has(item.id))
  const showNotFound = (photoRead || checked.size > 0) && notFound.length > 0

  const handleRecognized = (ids: string[]) => {
    setPhotoRead(true)
    onRecognized(ids)
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 px-4 pt-3 pb-36 md:mx-auto md:w-full md:max-w-4xl md:gap-5 md:pt-6">
        <Stepper current={1} />

        <div className="flex items-center gap-3 md:justify-center">
          <GrannyFigure />
          <Bubble>{data.lines.greeting}</Bubble>
        </div>

        <PhotoReader pantry={data.pantry} onRecognized={handleRecognized} />

        <div className={`grid gap-4 md:items-start md:gap-5 ${showNotFound ? 'md:grid-cols-2' : ''}`}>
          <Card title="見つかった材料">
            {selected.length > 0 ? (
              <ul className="mb-3 flex flex-col gap-2">
                {selected.map((item) => (
                  <li key={item.id} className="flex items-center gap-2">
                    <span className="flex min-h-11 flex-1 items-center rounded-[10px] border-[1.5px] border-line px-3 font-bold">
                      {item.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggle(item.id)}
                      aria-label={`${item.label}を削除`}
                      className="h-11 w-11 shrink-0 rounded-[10px] border-[1.5px] border-line text-lg text-sumi"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-3 text-sm leading-relaxed text-sumi">
                まだねえな。写真を撮るか、「＋ 材料を足すべ」から選んでけさい
              </p>
            )}
            <IngredientPicker pantry={data.pantry} checked={checked} onToggle={onToggle} />
          </Card>

          {showNotFound && (
            <Card title="この食材はねえか？">
              <p className="mb-3 text-sm leading-relaxed text-sumi">
                本物のこづゆに使う材料だ。手元にあったら押して足してけさい
              </p>
              <div className="grid grid-cols-3 gap-2">
                {notFound.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onToggle(item.id)}
                    className="flex min-h-11 items-center justify-center rounded-xl border-2 border-line bg-white px-1 py-2 text-[13px] leading-tight font-bold tracking-tighter active:bg-stone-100 md:text-[15px]"
                  >
                    ＋ {item.label}
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-[430px] bg-gradient-to-t from-kinari via-kinari to-transparent px-4 pt-6 pb-5 md:bottom-6 md:max-w-5xl md:rounded-b-3xl md:px-10">
        <div className="mb-2 flex items-center justify-between text-[13px] font-bold md:mx-auto md:max-w-[864px]">
          <span>{selected.length} つの材料で考えるべ</span>
          <span className="font-medium text-sumi">直したら次へ進むべ</span>
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={checked.size === 0}
          className="min-h-14 w-full rounded-full bg-shu text-lg font-bold text-white shadow-lg transition-opacity disabled:opacity-40 md:mx-auto md:block md:max-w-[864px]"
        >
          こづゆばあちゃんに見せるべ
        </button>
      </div>
    </>
  )
}
