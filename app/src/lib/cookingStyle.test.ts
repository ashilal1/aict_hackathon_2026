import { describe, expect, it } from 'vitest'
import kozuyu from '../data/kozuyu.json'
import type { KozuyuData } from '../data/types'
import { describeKozuyu, selectedEnhancements, styleById, supplementalEnhancements } from './cookingStyle'

const data = kozuyu as KozuyuData

describe('作り方の方針', () => {
  it('お手軽は身近な材料を、本格は定番材料を初期選択する', () => {
    expect(styleById('easy').recommendedIds).toContain('dashinomoto')
    expect(styleById('easy').recommendedIds).not.toContain('kaibashira')
    expect(styleById('authentic').recommendedIds).toContain('kaibashira')
    expect(styleById('authentic').recommendedIds).toContain('mamefu')
  })

  it('自分流は材料を初期選択しない', () => {
    expect(styleById('custom').recommendedIds).toEqual([])
  })

  it('選んだひと手間の理由を特徴に加える', () => {
    const text = describeKozuyu(styleById('easy'), new Set(['dashinomoto', 'hoshishiitake', 'mamefu']), data)
    expect(text).toContain('短い手順')
    expect(text).toContain('だしに奥行き')
    expect(text).toContain('こづゆならではの食感')
  })

  it('方針から材料を変えても、実際の選択と矛盾する説明をしない', () => {
    expect(describeKozuyu(styleById('easy'), new Set(['kaibashira']), data)).toContain('ひと手間')
    expect(describeKozuyu(styleById('authentic'), new Set(['dashinomoto']), data)).not.toContain(
      '干し貝柱を前日から戻し',
    )
  })

  it('選んだ追加材料の使い方だけを取り出す', () => {
    const selected = selectedEnhancements(new Set(['hoshishiitake', 'ninjin']), data.enhancements)
    expect(selected.map((item) => item.pantryId)).toEqual(['hoshishiitake'])
    expect(selected[0].preparation).toContain('戻し汁')
  })

  it('基本手順に含まれるだし材料は、追加の使い方から除く', () => {
    const selected = supplementalEnhancements(
      new Set(['kaibashira', 'hoshishiitake', 'mamefu']),
      data.enhancements,
      ['kaibashira'],
    )
    expect(selected.map((item) => item.pantryId)).toEqual(['hoshishiitake', 'mamefu'])
  })
})
