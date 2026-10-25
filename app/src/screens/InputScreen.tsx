import type { KozuyuData, PantryGroup } from '../data/types'
import { Bubble, Card, DraftNote, GrannyFace } from '../components/parts'
import { PhotoReader } from '../components/PhotoReader'

const GROUPS: PantryGroup[] = ['調味料・だし', '具']

type Props = {
  data: KozuyuData
  checked: Set<string>
  onToggle: (id: string) => void
  onRecognized: (ids: string[]) => void
  onSubmit: () => void
}

export function InputScreen({ data, checked, onToggle, onRecognized, onSubmit }: Props) {
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 px-4 pt-5 pb-28 md:gap-6 md:px-10 md:pt-6 md:pb-32">
        <div className="flex items-center gap-4 md:justify-center">
          <GrannyFace size={72} />
          <Bubble>{data.lines.greeting}</Bubble>
        </div>
        <h1 className="text-center text-2xl font-bold">材料入力</h1>

        <PhotoReader pantry={data.pantry} onRecognized={onRecognized} />
        <p className="text-center text-sm text-sumi">
          写真で見つかった材料は、下の一覧で選んだ状態になります。違っていたら押して直してください
        </p>

        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          {GROUPS.map((group) => (
            <Card key={group} title={group}>
              <div className="grid grid-cols-3 gap-2">
                {data.pantry
                  .filter((item) => item.group === group)
                  .map((item) => {
                    const on = checked.has(item.id)
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => onToggle(item.id)}
                        className={`flex min-h-14 items-center justify-center rounded-xl border-2 px-1 py-2 text-[13px] leading-tight font-bold tracking-tighter md:min-h-16 md:text-[15px] md:tracking-tight transition-colors ${
                          on
                            ? 'border-shu bg-shu text-white shadow-sm'
                            : 'border-stone-200 bg-white text-ai active:bg-stone-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    )
                  })}
              </div>
            </Card>
          ))}
        </div>

        {data.draft && <DraftNote />}
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-[430px] bg-gradient-to-t md:bottom-6 md:max-w-5xl md:rounded-b-3xl md:px-10 from-kinari via-kinari to-transparent px-4 pt-6 pb-5">
        <button
          type="button"
          onClick={onSubmit}
          disabled={checked.size === 0}
          className="w-full rounded-full bg-shu py-4 text-lg md:mx-auto md:block md:max-w-md font-bold text-white shadow-lg transition-opacity disabled:opacity-40"
        >
          ばあちゃんに見せる
        </button>
      </div>
    </>
  )
}
