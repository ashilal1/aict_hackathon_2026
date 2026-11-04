import type { KozuyuData } from '../data/types'
import { Bubble, Card, DraftNote, GrannyFace, Stepper } from '../components/parts'
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

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 px-4 pt-3 pb-36 md:mx-auto md:w-full md:max-w-xl md:gap-5 md:pt-6">
        <Stepper current={1} />

        <div className="flex items-center gap-3 md:justify-center">
          <GrannyFace size={56} />
          <Bubble>{data.lines.greeting}</Bubble>
        </div>

        <PhotoReader pantry={data.pantry} onRecognized={onRecognized} />

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
              まだありません。写真を撮るか、「＋ 材料を足す」から選んでください
            </p>
          )}
          <IngredientPicker
            pantry={data.pantry}
            checked={checked}
            onToggle={onToggle}
            defaultOpen={checked.size === 0}
          />
        </Card>

        {data.draft && (
          <DraftNote>写真の認識は、試作前の仮の精度です。違っていたら直してから次へ進んでください</DraftNote>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-[430px] bg-gradient-to-t from-kinari via-kinari to-transparent px-4 pt-6 pb-5 md:bottom-6 md:max-w-5xl md:rounded-b-3xl md:px-10">
        <div className="mb-2 flex items-center justify-between text-[13px] font-bold md:mx-auto md:max-w-md">
          <span>{selected.length} つの材料で考える</span>
          <span className="font-medium text-sumi">直したら次へ</span>
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={checked.size === 0}
          className="min-h-14 w-full rounded-full bg-shu text-lg font-bold text-white shadow-lg transition-opacity disabled:opacity-40 md:mx-auto md:block md:max-w-md"
        >
          ばあちゃんに見せる
        </button>
      </div>
    </>
  )
}
