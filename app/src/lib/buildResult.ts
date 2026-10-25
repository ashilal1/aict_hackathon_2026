import type { KozuyuData, Part, Source, Template } from '../data/types'

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

export type Result = {
  template: Template | null
  // 配合テンプレがどれも作れないとき、どれか 1 つあれば作れる材料
  needOneOf: string[]
  rows: Row[]
  aizu: AizuItem[]
  memo: string | null
}

const MEMO_MAX_LINES = 3

// templates を上から見て、requires がすべてそろう最初のものを選ぶ（並び順が優先順位）
function pickTemplate(checked: Set<string>, templates: Template[]): Template | null {
  return templates.find((t) => t.requires.every((id) => checked.has(id))) ?? null
}

function buildRow(part: Part, checked: Set<string>): Row {
  const base = { partId: part.id, section: part.section, original: part.original, note: part.note }
  if (checked.has(part.realId)) {
    return { ...base, text: part.original, verdict: 'real' }
  }
  const sub = part.substitutes.find((s) => s.requires.every((id) => checked.has(id)))
  if (sub) {
    return { ...base, text: sub.text, verdict: sub.verdict }
  }
  return part.essential
    ? { ...base, text: '代わりなし', verdict: 'irreplaceable' }
    : { ...base, text: 'なくても作れる', verdict: 'omit' }
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

  return { template, needOneOf, rows, aizu, memo: buildMemo(aizu) }
}
