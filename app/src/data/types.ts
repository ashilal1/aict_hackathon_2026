// kozuyu.json の形。画面に出る事実はすべてこのデータから引用する（docs/architecture.md 4 章）

export type PantryGroup = '調味料・だし' | '具'

export type PantryItem = {
  id: string
  label: string
  group: PantryGroup
}

// 代用がどこまで足りるか。食べ比べが済むまでは仮の判定
export type Verdict = 'ok' | 'irreplaceable'

export type Substitute = {
  requires: string[]
  text: string
  verdict: Verdict
  // 本物を 1 としたときの近さ（0〜1）。食べ比べが済むまでは仮の値
  closeness: number
  // 代替食材を選んだ理由と違い。確認済みの範囲だけをモーダルに表示する
  trivia: {
    difference: string
    tip: string
    caution: string
  }
}

export type Part = {
  id: string
  section: 'dashi' | 'gu'
  original: string
  // これがチェックされていれば本物で作れる
  realId: string
  // 本物も代わりも無いとき、true なら「代わりがきかない」、false なら「なくても作れる」
  essential: boolean
  // 上から順に見て、requires がそろう最初のものを使う
  substitutes: Substitute[]
  note?: string
  // 「本物との近さ」100 点のうち、この材料が占める配点。全部の材料で合わせて 100 にする
  weight: number
  // 会津から買うなら（sources の id）
  aizu: string[]
}

export type Template = {
  id: string
  label: string
  requires: string[]
  servings: string
  time: string
  amounts: { item: string; qty: string }[]
  steps: string[]
  // 食べ比べで測った「本物との近さ」。測るまでは null（画面には見込みの点数を出す）
  tasting: Tasting | null
}

export type Tasting = {
  // 0〜100 の整数。DfC なら 100 −（違いの平均 × 10）に直してから入れる
  score: number
  people: number
  date: string
  // 食べ比べた鍋に使った材料（pantry の id）。同じ材料がそろったときだけ、この点数を出す
  ingredients: string[]
}

export type Consent = 'confirmed' | 'public_only' | 'none'

export type Source = {
  id: string
  kind: 'maker' | 'seller' | 'restaurant'
  name: string
  consent: Consent
  how: string[]
  url: string | null
  checked_at: string | null
}

export type KozuyuData = {
  dish: string
  // true のあいだは、分量・判定が試作前の仮の値であることを画面に出す
  draft: boolean
  pantry: PantryItem[]
  parts: Part[]
  templates: Template[]
  sources: Source[]
  lines: {
    greeting: string
    judging: string
    recipeJudging: string
    noTemplate: string
    completion: string
    cookingTips: string[]
    // 点数ごとのばあちゃんの一言。min 点以上で、上から最初に当てはまるものを使う
    score: { min: number; text: string }[]
  }
}
