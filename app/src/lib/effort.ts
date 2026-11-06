import type { CookingStyleId } from './cookingStyle'

export type EffortId = 'quick' | 'standard' | 'careful'

export type EffortLevel = {
  id: EffortId
  shortLabel: string
  dashiTime: string
  dashiMethod: string
  caution?: string
}

// 出汁にかける時間を軸にした仮の3段階。短時間の手順は試作後に差し替える
const EFFORT_LEVELS: EffortLevel[] = [
  {
    id: 'quick',
    shortLabel: 'すぐ作る',
    dashiTime: '出汁の準備 0分',
    dashiMethod: 'ホタテ缶や顆粒だしなんか、選んだ代わりのだしを水に入れてけさい。味付けは薄めから始めっせ。',
    caution: '短時間で本来の出汁を再現できる、っつう意味ではねえ。',
  },
  {
    id: 'standard',
    shortLabel: '短時間',
    dashiTime: '出汁の準備 約15分',
    dashiMethod:
      '選んだだしの材料を水に入れて、弱めの火で煮ながらうま味を移してけさい。具を入れる前に味を見っせ。',
  },
  {
    id: 'careful',
    shortLabel: '一晩',
    dashiTime: '前の晩から',
    dashiMethod:
      '干し貝柱・昆布・干し椎茸を水に浸して、一晩置いて出汁を取ってけさい。戻し汁も捨てねえで使うべ。',
    caution: '店で教わった、出汁を大切にする方法だ。',
  },
]

export const effortById = (id: EffortId) => EFFORT_LEVELS.find((level) => level.id === id)!

// 最初に選んだ作り方と材料から、出汁の取り方を決める
// 干し貝柱は一晩戻して使うので、選んでいれば作り方によらず前日から取る
export function effortFor(style: CookingStyleId | null, checked: Set<string>): EffortId {
  if (checked.has('kaibashira')) return 'careful'
  return style === 'easy' ? 'quick' : 'standard'
}

// 里芋の下ゆでと、麩を最後に入れることは、資料で多い作り方（docs/kozuyu-variations.md）
// 選んだ材料にかかわる分だけ、レシピの手順に足す
// extras は kozuyu.json に無い、使う人が自分で足すと選んだ食材。具を扱う手順の前に一言添える
export function withPreparation(
  steps: string[],
  checked: Set<string>,
  extras: Iterable<string> = [],
): string[] {
  const hasFu = checked.has('mamefu') || checked.has('fu')
  const names = [...extras]
  const extraIndex = Math.max(
    steps.findIndex((step) => step.includes('具を')),
    0,
  )
  const withExtras =
    names.length > 0
      ? [
          ...steps.slice(0, extraIndex),
          `自分で足す${names.join('・')}も、具といっしょに好みの分だけ使ってけさい`,
          ...steps.slice(extraIndex),
        ]
      : steps
  return [
    ...(checked.has('satoimo') ? ['里芋は下ゆでして洗って、ぬめりを取ってけさい'] : []),
    ...(hasFu ? ['麩は最後に入れっから、よけといてけさい'] : []),
    ...withExtras,
    ...(hasFu ? ['最後に麩を入れて、汁を含ませてけさい'] : []),
  ]
}

export function cookingStepsFor(steps: string[], effort: EffortLevel): string[] {
  const withoutOvernightStep = steps.filter((step) => !step.includes('前の晩に、干し貝柱を水に浸けて戻す'))
  return [effort.dashiMethod, ...withoutOvernightStep]
}
