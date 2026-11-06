// kozuyu.json の形。画面に出る事実はすべてこのデータから引用する（docs/architecture.md 4 章）

export type PantryGroup = '調味料・だし' | '具'

export type PantryItem = {
  id: string
  label: string
  group: PantryGroup
}

// 写真に写っていた食材。pantryId があれば、こづゆの材料として使える
export type RecognizedFood = {
  name: string
  pantryId: string | null
}

// 判定の結果に出す、任意のひと手間
export type Enhancement = {
  id: string
  pantryId: string
  title: string
  reason: string
}

// 代用がどこまで足りるか。食べ比べが済むまでは仮の判定
export type Verdict = 'ok' | 'irreplaceable'

export type Substitute = {
  requires: string[]
  text: string
  verdict: Verdict
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

// 作った人が食べて ⚪︎／❌ を付ける項目。中身はチームで決める（docs/open-questions.md 2 章）
export type EvaluationAspect = {
  id: string
  label: string
  // hint は答える前から出す補足、note は答えたあとに出す説明
  items: { id: string; text: string; hint?: string; note: string }[]
}

export type KozuyuData = {
  dish: string
  // オンボーディングのこづゆの説明
  intro: {
    greeting: string
    ingredients: { label: string; fact: string }[]
    words: { word: string; meaning: string }[]
  }
  // アプリを開いて最初に出す、使い方とこづゆばあちゃんの紹介
  onboarding: {
    greeting: string
    howTo: { title: string; text: string }[]
    granny: {
      greeting: string
      profile: { label: string; text: string }[]
      note: string
    }
    declaration: {
      items: string[]
      closing: string[]
    }
  }
  pantry: PantryItem[]
  enhancements: Enhancement[]
  parts: Part[]
  templates: Template[]
  sources: Source[]
  lines: {
    greeting: string
    recommendation: string
    judging: string
    noTemplate: string
    completion: string
    evaluation: string
    cookingTips: string[]
  }
  evaluation: {
    aspects: EvaluationAspect[]
  }
}
