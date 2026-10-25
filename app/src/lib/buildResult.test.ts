import { describe, expect, it } from 'vitest'
import kozuyu from '../data/kozuyu.json'
import type { KozuyuData, Source } from '../data/types'
import { SCORE_MAX, buildResult, commentFor, toDisplaySource } from './buildResult'

const data = kozuyu as KozuyuData

const rowOf = (checked: string[], partId: string) =>
  buildResult(checked, data).rows.find((r) => r.partId === partId)!

describe('配合テンプレの選び方', () => {
  it('上にあるテンプレを優先する（干し貝柱があれば本物のだし）', () => {
    const result = buildResult(['kaibashira', 'dashinomoto', 'oyster'], data)
    expect(result.template?.id).toBe('real')
  })

  it('requires がすべてそろったものだけを選ぶ', () => {
    expect(buildResult(['oyster'], data).template).toBeNull()
    expect(buildResult(['dashinomoto', 'oyster'], data).template?.id).toBe('dashi_oyster')
  })

  it('どれも作れなければ、1 つあれば作れる材料を出す', () => {
    const result = buildResult(['ninjin'], data)
    expect(result.template).toBeNull()
    expect(result.needOneOf).toEqual(['干し貝柱', 'ホタテ缶', 'だしの素', '白だし'])
  })
})

describe('本物と今回の代わり', () => {
  it('本物があれば本物を出す', () => {
    expect(rowOf(['mamefu'], 'mamefu')).toMatchObject({ text: '豆麩', verdict: 'real' })
  })

  it('代わりは上から順に、そろう最初のものを出す', () => {
    expect(rowOf(['hotate_can', 'dashinomoto'], 'kaibashira').text).toBe('ホタテ缶（汁ごと）')
    expect(rowOf(['dashinomoto'], 'kaibashira')).toMatchObject({
      text: 'だしの素',
      verdict: 'irreplaceable',
    })
  })

  it('本物も代わりも無いとき、外せない材料は「代わりなし」、それ以外は「なくても作れる」', () => {
    expect(rowOf([], 'mamefu')).toMatchObject({ text: '代わりなし', verdict: 'irreplaceable' })
    expect(rowOf([], 'kikurage')).toMatchObject({ text: 'なくても作れる', verdict: 'omit' })
  })
})

describe('会津から買うなら', () => {
  it('代わりがきかない行だけを出す', () => {
    const result = buildResult(['dashinomoto', 'oyster', 'fu', 'jagaimo'], data)
    expect(result.aizu.map((a) => a.original)).toEqual(['豆麩'])
  })

  it('了承が無い作り手は名前を出さない', () => {
    const result = buildResult([], data)
    const mamefu = result.aizu.find((a) => a.original === '豆麩')!
    expect(mamefu.sources[0].label).toBe('会津若松の事業者が作っているもの')
    expect(mamefu.sources[0].url).toBeNull()
  })

  it('了承の状態で出し方を変える', () => {
    const base: Source = {
      id: 'x',
      kind: 'maker',
      name: '会津の作り手',
      consent: 'confirmed',
      how: ['店頭'],
      url: 'https://example.com',
      checked_at: '2026-10-26',
    }
    expect(toDisplaySource(base)).toMatchObject({ label: '会津の作り手', publicOnly: false })
    expect(toDisplaySource({ ...base, consent: 'public_only' })).toMatchObject({ publicOnly: true })
    expect(toDisplaySource({ ...base, consent: 'none', kind: 'restaurant' })).toBeNull()
  })

  it('買い物メモは 3 行までにする', () => {
    const memo = buildResult([], data).memo!
    const lines = memo.split('\n').slice(1)
    expect(lines.length).toBeGreaterThan(0)
    expect(lines.length).toBeLessThanOrEqual(3)
  })

  it('代わりがきかない行が無ければメモは出さない', () => {
    const all = data.pantry.map((p) => p.id)
    expect(buildResult(all, data).memo).toBeNull()
  })
})

describe('本物との近さ（点数）', () => {
  const all = data.pantry.map((p) => p.id)

  it('全部本物なら 100 点、何も無ければ 0 点', () => {
    expect(buildResult(all, data).score.value).toBe(SCORE_MAX)
    expect(buildResult([], data).score.value).toBe(0)
  })

  it('見込みの点数は「配点 × 代わりの近さ」を材料ごとに足したもの', () => {
    // 干し貝柱 35 × だしの素＋オイスターソース 0.6 = 21、豆麩 20 × お麩 0.4 = 8、にんじん 8
    const result = buildResult(['dashinomoto', 'oyster', 'fu', 'ninjin'], data)
    expect(result.score).toMatchObject({ kind: 'estimate', value: 21 + 8 + 8 })
    expect(result.score.value).toBe(result.rows.reduce((sum, row) => sum + row.points, 0))
  })

  const tastedPot = ['dashinomoto', 'oyster', 'fu', 'jagaimo', 'ninjin', 'itokon', 'kikurage']
  const tasted: KozuyuData = {
    ...data,
    templates: data.templates.map((t) =>
      t.id === 'dashi_oyster'
        ? { ...t, tasting: { score: 72, people: 20, date: '2026-11-01', ingredients: tastedPot } }
        : t,
    ),
  }

  it('食べ比べた鍋と同じ材料なら、測った点数を見込みより優先する', () => {
    expect(buildResult(tastedPot, tasted).score).toMatchObject({ kind: 'measured', value: 72, people: 20 })
  })

  it('同じ配合でも、具が違えば測った点数は使わず見込みに戻す', () => {
    expect(buildResult(['dashinomoto', 'oyster'], tasted).score.kind).toBe('estimate')
  })

  it('「会津の本物で」と言うのは、代わりがきかない材料で足りなかった点だけ', () => {
    // 豆麩 → お麩（代わりがきかない）: 20 − 8 = 12。省いたにんじんなどは数えない
    const result = buildResult(['dashinomoto', 'oyster', 'fu'], data)
    expect(result.score).toMatchObject({ kind: 'estimate', aizuGap: 12 })
  })

  it('点数に合ったばあちゃんの一言を選ぶ（JSON の並び順に頼らない）', () => {
    const lines = data.lines.score
    const top = lines.reduce((a, b) => (a.min > b.min ? a : b))
    const bottom = lines.reduce((a, b) => (a.min < b.min ? a : b))
    expect(commentFor(SCORE_MAX, lines)).toBe(top.text)
    expect(commentFor(SCORE_MAX, [...lines].reverse())).toBe(top.text)
    expect(commentFor(0, [...lines].reverse())).toBe(bottom.text)
    expect(buildResult([], data).score.comment).toBe(bottom.text)
  })
})

// チームが kozuyu.json を書き換えたときに、つづりの間違いで画面が壊れないようにする
describe('kozuyu.json の中身', () => {
  const pantryIds = new Set(data.pantry.map((p) => p.id))
  const sourceIds = new Set(data.sources.map((s) => s.id))

  it('requires・realId はすべて pantry にある', () => {
    const ids = [
      ...data.templates.flatMap((t) => t.requires),
      ...data.parts.flatMap((p) => [p.realId, ...p.substitutes.flatMap((s) => s.requires)]),
    ]
    expect(ids.filter((id) => !pantryIds.has(id))).toEqual([])
  })

  it('aizu はすべて sources にある', () => {
    const ids = data.parts.flatMap((p) => p.aizu)
    expect(ids.filter((id) => !sourceIds.has(id))).toEqual([])
  })

  it('配点は合わせて 100、代わりの近さは 0〜1', () => {
    expect(data.parts.reduce((sum, p) => sum + p.weight, 0)).toBe(SCORE_MAX)
    const closeness = data.parts.flatMap((p) => p.substitutes.map((s) => s.closeness))
    expect(closeness.every((c) => c >= 0 && c <= 1)).toBe(true)
  })

  it('点数の一言は 0 点まで当てはまる', () => {
    expect(data.lines.score.some((line) => line.min === 0)).toBe(true)
  })

  it('食べ比べの点数は 0〜100 の整数で、人数・日付・材料がそろっている', () => {
    const tastings = data.templates.flatMap((t) => (t.tasting ? [t.tasting] : []))
    for (const t of tastings) {
      expect(Number.isInteger(t.score) && t.score >= 0 && t.score <= SCORE_MAX).toBe(true)
      expect(Number.isInteger(t.people) && t.people >= 1).toBe(true)
      expect(t.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(t.ingredients.filter((id) => !pantryIds.has(id))).toEqual([])
    }
  })

  it('verdict と consent は決めた値だけ', () => {
    const verdicts = data.parts.flatMap((p) => p.substitutes.map((s) => s.verdict))
    expect(verdicts.every((v) => v === 'ok' || v === 'irreplaceable')).toBe(true)
    const consents = data.sources.map((s) => s.consent)
    expect(consents.every((c) => ['confirmed', 'public_only', 'none'].includes(c))).toBe(true)
  })
})
