import type { KozuyuData, PantryGroup } from '../data/types'
import type { Result } from '../lib/buildResult'
import { describeKozuyu, selectedEnhancements, selectedItems, type CookingStyle } from '../lib/cookingStyle'
import { Bubble, Card, DraftNote, GrannyFace, StepHeader } from '../components/parts'

const GROUPS: PantryGroup[] = ['調味料・だし', '具']

type Props = {
  data: KozuyuData
  result: Result
  style: CookingStyle
  checked: Set<string>
  onStartCooking: () => void
  onBack: () => void
}

export function ResultScreen({ data, result, style, checked, onStartCooking, onBack }: Props) {
  const template = result.template
  const ingredients = selectedItems(checked, data.pantry)
  const enhancements = selectedEnhancements(checked, data.enhancements)

  if (!template) return null

  return (
    <div className="flex flex-1 flex-col gap-5 px-4 pt-5 pb-8 md:px-10 md:pt-8">
      <StepHeader step={3} title="完成！あなたのこづゆ" />
      <div className="flex items-center gap-4 md:justify-center">
        <GrannyFace size={64} />
        <Bubble>自分で選んだ理由がある、今日の一杯だな</Bubble>
      </div>

      <Card title={style.label}>
        <p className="leading-relaxed text-sumi">{describeKozuyu(style, checked, data)}</p>
      </Card>

      <Card title="選んだ材料">
        <div className="grid gap-4 md:grid-cols-2">
          {GROUPS.map((group) => (
            <div key={group}>
              <h3 className="mb-2 text-sm font-bold text-sumi">{group}</h3>
              <ul className="flex flex-wrap gap-2">
                {ingredients
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <li key={item.id} className="rounded-full bg-kinari px-3 py-1.5 text-sm font-bold">
                      {item.label}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex flex-wrap items-baseline gap-x-3">
          <h2 className="text-xl font-bold">今日の{data.dish}</h2>
          <span className="text-sm text-sumi">
            {template.servings}・{template.time}
          </span>
        </div>
        <p className="mb-2 text-sm font-bold text-kincha">{template.label}</p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-xl bg-kinari px-3 py-2 text-sm">
          {template.amounts.map((amount) => (
            <div key={amount.item} className="contents">
              <dt>{amount.item}</dt>
              <dd className="font-bold">{amount.qty}</dd>
            </div>
          ))}
        </dl>
        {enhancements.length > 0 && (
          <p className="mt-4 rounded-xl border border-dashed border-kincha p-3 text-sm leading-relaxed text-sumi">
            {data.lines.extraAmountNote}
          </p>
        )}
      </Card>

      {data.draft && <DraftNote />}
      <button
        type="button"
        onClick={onStartCooking}
        className="min-h-12 w-full rounded-full bg-shu py-4 text-lg font-bold text-white shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-kincha/50"
      >
        調理手順を見る
      </button>
      <button
        type="button"
        onClick={onBack}
        className="min-h-11 w-full rounded-full border-2 border-ai py-3 font-bold text-ai focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-kincha/50"
      >
        材料を選び直す
      </button>
    </div>
  )
}
