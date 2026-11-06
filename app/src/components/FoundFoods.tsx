import type { PantryItem, RecognizedFood } from '../data/types'

type Props = {
  foods: RecognizedFood[]
  pantry: PantryItem[]
  checked: Set<string>
  extras: Set<string>
  onToggle: (id: string) => void
  onToggleExtra: (name: string) => void
}

// 写真で見つかった食材と手で足した材料をすべて並べ、使うものを押して選ぶ
// AI は選ばない。kozuyu.json に無い食材も「自分で足すもの」として選べる
export function FoundFoods({ foods, pantry, checked, extras, onToggle, onToggleExtra }: Props) {
  const fromPicker: RecognizedFood[] = pantry
    .filter((item) => checked.has(item.id) && !foods.some((food) => food.pantryId === item.id))
    .map((item) => ({ name: item.label, pantryId: item.id }))
  const rows = [...foods, ...fromPicker]

  if (rows.length === 0) {
    return (
      <p className="mb-3 text-sm leading-relaxed text-sumi">
        まだねえな。写真を撮るか、「＋ 材料を足すべ」から選んでけさい
      </p>
    )
  }

  return (
    <div className="mb-3">
      <p className="mb-2 text-sm leading-relaxed text-sumi">今日使うもんを、押して選んでけさい</p>
      <ul className="grid grid-cols-2 gap-2">
        {rows.map((food) => {
          const { name, pantryId } = food
          const label = pantryId ? pantry.find((item) => item.id === pantryId)?.label : undefined
          const on = pantryId ? checked.has(pantryId) : extras.has(name)
          return (
            <li key={name}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => (pantryId ? onToggle(pantryId) : onToggleExtra(name))}
                className={`flex min-h-12 w-full items-center gap-2 rounded-[10px] border-[1.5px] px-2.5 py-1.5 text-left ${
                  on ? 'border-kincha bg-[#fffdf7]' : 'border-line bg-white'
                }`}
              >
                <span
                  aria-hidden
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-[1.5px] text-xs ${
                    on ? 'border-ai bg-ai text-white' : 'border-line'
                  }`}
                >
                  {on && '✓'}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm leading-tight font-bold break-words">{name}</span>
                  <span className="block text-[11px] leading-tight text-sumi">
                    {pantryId
                      ? `こづゆの材料${label && label !== name ? `（${label}）` : ''}`
                      : '自分で足すもの'}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
