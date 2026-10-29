export type EffortId = 'quick' | 'standard' | 'careful'

export type EffortLevel = {
  id: EffortId
  label: string
  shortLabel: string
  description: string
  advice: string
  dashiTime: string
  dashiMethod: string
  caution: string
}

// 出汁にかける時間を軸にした仮の3段階。短時間の手順は試作後に差し替える
export const EFFORT_LEVELS: EffortLevel[] = [
  {
    id: 'quick',
    label: '出汁を取らずに作る',
    shortLabel: 'すぐ作る',
    description: 'ホタテ缶や顆粒だしなど、すぐ使える代替だしで作る',
    advice: '時間をかけた出汁とは香りやうま味が異なります。まず作ってみる入口として選ぶ方法です。',
    dashiTime: '出汁の準備 0分',
    dashiMethod: 'ホタテ缶や顆粒だしなど、選んだ代替だしを水に加える。味付けは薄めから始める。',
    caution: '短時間で本来の出汁を再現できる、という意味ではありません。',
  },
  {
    id: 'standard',
    label: '短時間でうま味を重ねる',
    shortLabel: '短時間',
    description: '手元のだし材料を具と一緒に煮ながら、うま味を重ねる',
    advice: '出汁だけを一晩取る方法ではありません。具材の大きさをそろえ、煮汁にうま味を移します。',
    dashiTime: '出汁の準備 約15分（仮）',
    dashiMethod: '選んだだし材料を水に入れ、弱めの火で煮ながらうま味を移す。具材を加える前に味を見る。',
    caution: '時間と手順はチーム試作前の仮案です。試作後に調整します。',
  },
  {
    id: 'careful',
    label: '前日から出汁を取る',
    shortLabel: '一晩',
    description: '干し貝柱・昆布・干し椎茸を水に浸し、じっくり出汁を取る',
    advice: '時間が取れる日は、だしを丁寧に取るほど調味料を抑えてもうま味を感じやすくなります。',
    dashiTime: '前の晩から',
    dashiMethod: '干し貝柱・昆布・干し椎茸を水に浸し、一晩置いて出汁を取る。戻し汁も捨てずに使う。',
    caution: '店舗ヒアリングで教わった、出汁を大切にする方法です。分量は現在も試作前の仮値です。',
  },
]

export const effortById = (id: EffortId) => EFFORT_LEVELS.find((level) => level.id === id)!

export function cookingStepsFor(steps: string[], effort: EffortLevel): string[] {
  const withoutOvernightStep = steps.filter((step) => !step.includes('前の晩に、干し貝柱を水に浸けて戻す'))
  return [effort.dashiMethod, ...withoutOvernightStep]
}
