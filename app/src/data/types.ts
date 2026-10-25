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
    result: string
    noTemplate: string
  }
}
