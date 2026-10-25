import type { KozuyuData, Part, Source, Tasting, Template } from '../data/types'

// チェックされた材料と kozuyu.json から、結果画面に出すものを組み立てる。AI は使わない
// ルールは docs/architecture.md 5 章。画面に出る文字と数字は、すべて data からの引用にする

export type RowVerdict = 'real' | 'ok' | 'irreplaceable' | 'omit'

export type Row = {
  partId: string
  section: Part['section']
  original: string
  text: string
  verdict: RowVerdict
  note?: string
  // 「本物との近さ」のうち、この材料で取れた点と配点
  points: number
  weight: number
}

export type DisplaySource = {
  label: string
  how: string[]
  url: string | null
  publicOnly: boolean
}

export type AizuItem = {
  original: string
  sources: DisplaySource[]
}

// 本物との近さ。食べ比べで測った点数があればそれを、無ければ材料から出した見込みを使う
// aizuGap: 代わりがきかない材料で足りなかった点（「会津の本物で」と言えるのはこの分だけ）
export type Score =
  | { kind: 'estimate'; value: number; aizuGap: number; comment: string }
  | { kind: 'measured'; value: number; people: number; date: string; comment: string }

export const SCORE_MAX = 100

export type Result = {
  template: Template | null
  // 配合テンプレがどれも作れないとき、どれか 1 つあれば作れる材料
  needOneOf: string[]
  rows: Row[]
  aizu: AizuItem[]
  memo: string | null
  score: Score
}

const MEMO_MAX_LINES = 3

// templates を上から見て、requires がすべてそろう最初のものを選ぶ（並び順が優先順位）
function pickTemplate(checked: Set<string>, templates: Template[]): Template | null {
  return templates.find((t) => t.requires.every((id) => checked.has(id))) ?? null
}

// 見込みの点数は「材料ごとの配点 × 代わりの近さ」。本物なら配点まるごと、無ければ 0 点
function buildRow(part: Part, checked: Set<string>): Row {
  const base = {
    partId: part.id,
    section: part.section,
    original: part.original,
    note: part.note,
    weight: part.weight,
  }
  if (checked.has(part.realId)) {
    return { ...base, text: part.original, verdict: 'real', points: part.weight }
  }
  const sub = part.substitutes.find((s) => s.requires.every((id) => checked.has(id)))
  if (sub) {
    return { ...base, text: sub.text, verdict: sub.verdict, points: Math.round(part.weight * sub.closeness) }
  }
  return part.essential
    ? { ...base, text: '代わりなし', verdict: 'irreplaceable', points: 0 }
    : { ...base, text: 'なくても作れる', verdict: 'omit', points: 0 }
}

// 点数に当てはまる一言のうち、min が一番高いものを選ぶ（JSON の並び順には頼らない）
export function commentFor(value: number, lines: KozuyuData['lines']['score']): string {
  const fit = lines.filter((line) => value >= line.min)
  return fit.reduce((best, line) => (line.min > best.min ? line : best), fit[0])?.text ?? ''
}

// 食べ比べた鍋と、本物・代わりの組み合わせがすべて同じなら true
function sameAsTasted(rows: Row[], tasting: Tasting, data: KozuyuData): boolean {
  const tasted = new Set(tasting.ingredients)
  return data.parts.every((part, i) => buildRow(part, tasted).text === rows[i].text)
}

function buildScore(rows: Row[], template: Template | null, data: KozuyuData): Score {
  const tasting = template?.tasting
  if (tasting && sameAsTasted(rows, tasting, data)) {
    const { score, people, date } = tasting
    return { kind: 'measured', value: score, people, date, comment: commentFor(score, data.lines.score) }
  }
  // 行ごとに丸めた点を足すので、画面の内訳と合計が必ず一致する
  const value = rows.reduce((sum, row) => sum + row.points, 0)
  const aizuGap = rows
    .filter((row) => row.verdict === 'irreplaceable')
    .reduce((sum, row) => sum + row.weight - row.points, 0)
  return { kind: 'estimate', value, aizuGap, comment: commentFor(value, data.lines.score) }
}

const GENERIC_LABEL: Record<Source['kind'], string> = {
  maker: '会津若松の事業者が作っているもの',
  seller: '会津若松の事業者が売っているもの',
  restaurant: '',
}

// 作り手・店の名前は、了承の状態によって出し方を変える
export function toDisplaySource(source: Source): DisplaySource | null {
  switch (source.consent) {
    case 'confirmed':
      return { label: source.name, how: source.how, url: source.url, publicOnly: false }
    case 'public_only':
      return { label: source.name, how: source.how, url: source.url, publicOnly: true }
    case 'none':
      // 了承の無い飲食店は行ごと出さない
      if (source.kind === 'restaurant') return null
      return { label: GENERIC_LABEL[source.kind], how: source.how, url: null, publicOnly: false }
  }
}

function buildMemo(aizu: AizuItem[]): string | null {
  if (aizu.length === 0) return null
  const lines = aizu.slice(0, MEMO_MAX_LINES).map((item) => {
    const how = item.sources.flatMap((s) => s.how)
    return `・${item.original}：${how.length > 0 ? how.join('／') : '買える場所は確認中'}`
  })
  return ['こづゆの買い物メモ（会津で買うもの）', ...lines].join('\n')
}

export function buildResult(checkedIds: Iterable<string>, data: KozuyuData): Result {
  const checked = new Set(checkedIds)
  const template = pickTemplate(checked, data.templates)
  const labelOf = (id: string) => data.pantry.find((p) => p.id === id)?.label ?? id
  const needOneOf = template
    ? []
    : data.templates.filter((t) => t.requires.length === 1).map((t) => labelOf(t.requires[0]))

  const rows = data.parts.map((part) => buildRow(part, checked))

  const aizu = rows
    .filter((row) => row.verdict === 'irreplaceable')
    .map((row) => {
      const part = data.parts.find((p) => p.id === row.partId)!
      const sources = part.aizu
        .map((id) => data.sources.find((s) => s.id === id))
        .filter((s): s is Source => s !== undefined)
        .map(toDisplaySource)
        .filter((s): s is DisplaySource => s !== null)
      return { original: row.original, sources }
    })

  return { template, needOneOf, rows, aizu, memo: buildMemo(aizu), score: buildScore(rows, template, data) }
}
