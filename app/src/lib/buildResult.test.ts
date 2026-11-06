import { describe, expect, it } from 'vitest'
import kozuyu from '../data/kozuyu.json'
import type { KozuyuData, Source } from '../data/types'
import { buildResult, toDisplaySource } from './buildResult'

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
    expect(rowOf(['hotate_can', 'dashinomoto'], 'kaibashira')).toMatchObject({
      text: 'ホタテ缶（汁ごと）',
      trivia: { difference: expect.any(String), tip: expect.any(String), caution: expect.any(String) },
    })
    expect(rowOf(['dashinomoto'], 'kaibashira')).toMatchObject({
      text: 'だしの素',
      verdict: 'irreplaceable',
    })
  })

  it('本物も代わりも無いとき、外せない材料は「代わりがねえ」、それ以外は「なくても作れっぞ」', () => {
    expect(rowOf([], 'mamefu')).toMatchObject({ text: '代わりがねえ', verdict: 'irreplaceable' })
    expect(rowOf([], 'kikurage')).toMatchObject({ text: 'なくても作れっぞ', verdict: 'omit' })
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
    expect(mamefu.sources[0].label).toBe('会津若松の事業者が作ってるもん')
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

describe('行を消すときに外す材料', () => {
  it('本物なら本物の材料、代わりならその代わりに使った材料', () => {
    expect(rowOf(['kaibashira', 'dashinomoto'], 'kaibashira').usedIds).toEqual(['kaibashira'])
    expect(rowOf(['dashinomoto', 'oyster'], 'kaibashira').usedIds).toEqual(['dashinomoto', 'oyster'])
  })

  it('本物も代わりも無ければ、外す材料は無い', () => {
    expect(rowOf([], 'mamefu').usedIds).toEqual([])
  })
})

// チームが kozuyu.json を書き換えたときに、つづりの間違いで画面が壊れないようにする
describe('kozuyu.json の中身', () => {
  it('もっとおいしくするには？の項目は、pantry にある材料を指している', () => {
    const pantryIds = new Set(data.pantry.map((item) => item.id))
    const ids = data.enhancements.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(data.enhancements.filter((item) => !pantryIds.has(item.pantryId))).toEqual([])
  })

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

  it('紹介の材料と言葉は、どれも説明がある', () => {
    expect(data.intro.ingredients.every((item) => item.label && item.fact)).toBe(true)
    expect(data.intro.words.every((item) => item.word && item.meaning)).toBe(true)
    expect(data.onboarding.howTo.every((item) => item.title && item.text)).toBe(true)
    expect(data.onboarding.granny.profile.every((item) => item.label && item.text)).toBe(true)
    expect(data.onboarding.declaration.items).toHaveLength(6)
  })

  it('評価の項目は 1 つ以上あり、id が重ならない', () => {
    expect(data.evaluation.aspects.flatMap((aspect) => aspect.items).every((item) => item.note)).toBe(true)
    const ids = data.evaluation.aspects.flatMap((aspect) => aspect.items.map((item) => item.id))
    expect(ids.length).toBeGreaterThan(0)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('verdict と consent は決めた値だけ', () => {
    const verdicts = data.parts.flatMap((p) => p.substitutes.map((s) => s.verdict))
    expect(verdicts.every((v) => v === 'ok' || v === 'irreplaceable')).toBe(true)
    const consents = data.sources.map((s) => s.consent)
    expect(consents.every((c) => ['confirmed', 'public_only', 'none'].includes(c))).toBe(true)
  })

  it('すべての代替食材に豆知識の3項目がある', () => {
    const trivia = data.parts.flatMap((part) => part.substitutes.map((substitute) => substitute.trivia))
    expect(trivia.length).toBeGreaterThan(0)
    expect(trivia.every((item) => item.difference && item.tip && item.caution)).toBe(true)
  })
})
