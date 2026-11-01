import type { KozuyuData, PantryGroup } from '../data/types'
import type { CookingStyle } from '../lib/cookingStyle'
import { Card, DraftNote, StepHeader } from '../components/parts'
import { PhotoReader } from '../components/PhotoReader'

const GROUPS: PantryGroup[] = ['調味料・だし', '具']

type Props = {
  data: KozuyuData
  style: CookingStyle
  checked: Set<string>
  canContinue: boolean
  onToggle: (id: string) => void
  onRecognized: (ids: string[]) => void
  onBack: () => void
  onSubmit: () => void
}

export function InputScreen({
  data,
  style,
  checked,
  canContinue,
  onToggle,
  onRecognized,
  onBack,
  onSubmit,
}: Props) {
  return (
    <div className="flex flex-1 flex-col gap-5 px-4 pt-5 pb-8 md:px-10 md:pt-8">
      <StepHeader step={2} title="材料を選ぶ" />
      <Card>
        <p className="text-sm font-bold text-shu">選んだ方針</p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold">{style.label}</h2>
          <button
            type="button"
            onClick={onBack}
            className="min-h-11 rounded-full border border-ai px-3 text-sm font-bold text-ai focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-kincha/50"
          >
            作り方を選び直す
          </button>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-sumi">
          {style.id === 'custom'
            ? '定番の材料を参考に、使いたいものを自由に選んでください。'
            : `${style.label}に合わせて、基本の材料を選んであります。自由に外したり、追加したりできます。`}
        </p>
      </Card>

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
                      className={`flex min-h-14 items-center justify-center rounded-xl border-2 px-1 py-2 text-[13px] leading-tight font-bold tracking-tighter transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-kincha/50 md:min-h-16 md:text-[15px] md:tracking-tight ${on ? 'border-shu bg-shu text-white shadow-sm' : 'border-stone-200 bg-white text-ai active:bg-stone-100'}`}
                    >
                      <span>
                        {on && <span aria-hidden>✓ </span>}
                        {item.label}
                      </span>
                    </button>
                  )
                })}
            </div>
          </Card>
        ))}
      </div>

      <section aria-labelledby="enhancement-title">
        <h2 id="enhancement-title" className="text-xl font-bold">
          もっとおいしくするには？
        </h2>
        <p className="mt-1 mb-3 text-sm text-sumi">気になるひと手間だけ、自由に取り入れられます。</p>
        <div className="grid gap-3 md:grid-cols-2">
          {data.enhancements.map((item) => {
            const on = checked.has(item.pantryId)
            return (
              <article key={item.id} className="rounded-2xl bg-white p-4 shadow-sm md:p-6">
                <h3 className="font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-sumi">{item.reason}</p>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => onToggle(item.pantryId)}
                  className={`mt-3 min-h-11 rounded-full border-2 px-4 text-sm font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-kincha/50 ${on ? 'border-shu bg-shu text-white' : 'border-ai text-ai'}`}
                >
                  {on ? '✓ 選択中' : '取り入れる'}
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <details className="rounded-2xl bg-white p-4 shadow-sm md:p-6">
        <summary className="cursor-pointer font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-kincha/50">
          写真から材料を追加する
        </summary>
        <div className="mt-4">
          <PhotoReader pantry={data.pantry} onRecognized={onRecognized} />
          <p className="mt-3 text-center text-sm text-sumi">
            写真で見つかった材料を選択に追加します。違っていたら、一覧で押して直してください。
          </p>
        </div>
      </details>

      {data.draft && <DraftNote />}
      {!canContinue && (
        <p
          className="rounded-xl bg-white p-3 text-center text-sm font-bold text-shu shadow-sm"
          aria-live="polite"
        >
          レシピを作るため、だしになる材料を1つ以上選んでください
        </p>
      )}
      <button
        type="button"
        onClick={onSubmit}
        disabled={!canContinue}
        className="min-h-12 w-full rounded-full bg-shu py-4 text-lg font-bold text-white shadow-lg transition-opacity focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-kincha/50 disabled:opacity-40"
      >
        この材料でレシピを見る
      </button>
    </div>
  )
}
