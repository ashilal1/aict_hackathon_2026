import { useState } from 'react'
import type { PantryGroup, PantryItem } from '../data/types'

const GROUPS: PantryGroup[] = ['調味料・だし', '具']

type Props = {
  pantry: PantryItem[]
  checked: Set<string>
  onToggle: (id: string) => void
  defaultOpen?: boolean
}

// 「＋ 材料を足す」を押すと、まだ選んでいない材料が出る。押した材料は選んだ側へ移る
// 名前は自由入力にしない。kozuyu.json にある材料だけを判定に使うため
export function IngredientPicker({ pantry, checked, onToggle, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const rest = pantry.filter((item) => !checked.has(item.id))

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-11 w-full rounded-xl border-2 border-dashed border-kincha bg-[#fffdf7] text-sm font-bold"
      >
        ＋ 材料を足す
      </button>
    )
  }

  return (
    <div className="space-y-3">
      {GROUPS.map((group) => {
        const items = rest.filter((item) => item.group === group)
        if (items.length === 0) return null
        return (
          <div key={group}>
            <p className="mb-1.5 text-xs font-bold text-sumi">{group}</p>
            <div className="grid grid-cols-3 gap-2">
              {items.map((item) => (
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
          </div>
        )
      })}
      {rest.length === 0 && <p className="text-sm text-sumi">足せる材料は、もうありません</p>}
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="w-full py-1 text-sm font-bold underline"
      >
        閉じる
      </button>
    </div>
  )
}
