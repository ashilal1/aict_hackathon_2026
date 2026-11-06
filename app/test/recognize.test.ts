import { describe, expect, it } from 'vitest'
import { MAX_IMAGES, buildPrompt, parseImages, pickFoods } from '../api/recognize.ts'

const pantry = [
  { id: 'dashinomoto', label: 'だしの素' },
  { id: 'mamefu', label: '豆麩' },
]

describe('写真の受け取り', () => {
  const image = { mediaType: 'image/jpeg', data: 'AAAA' }

  it('正しい写真はそのまま通す', () => {
    expect(parseImages({ images: [image] })).toEqual([image])
  })

  it('枚数・形式・中身がおかしければエラー文を返す', () => {
    expect(parseImages({})).toBe('写真がねえぞ')
    expect(parseImages({ images: Array(MAX_IMAGES + 1).fill(image) })).toBe('写真は 3 枚までだ')
    expect(parseImages({ images: [{ ...image, mediaType: 'image/gif' }] })).toBe('写真の形式が読めねえ')
    expect(parseImages({ images: [{ ...image, data: '' }] })).toBe('写真が空だ')
  })
})

describe('判定結果の受け取り', () => {
  it('pantry に無い食材も、名前を残してすべて返す', () => {
    const raw = {
      foods: [
        { name: '豆麩', pantryId: 'mamefu' },
        { name: '大根', pantryId: 'none' },
      ],
    }
    expect(pickFoods(raw, pantry)).toEqual([
      { name: '豆麩', pantryId: 'mamefu' },
      { name: '大根', pantryId: null },
    ])
  })

  it('pantry に無い id は、材料に当てない', () => {
    expect(pickFoods({ foods: [{ name: '昆布', pantryId: 'kombu' }] }, pantry)).toEqual([
      { name: '昆布', pantryId: null },
    ])
  })

  it('空の名前・名前の重複・形のおかしい行は捨てる', () => {
    const raw = {
      foods: [
        { name: ' 卵 ', pantryId: 'none' },
        { name: '卵', pantryId: 'none' },
        { name: '  ', pantryId: 'none' },
        { name: 3, pantryId: 'none' },
        null,
      ],
    }
    expect(pickFoods(raw, pantry)).toEqual([{ name: '卵', pantryId: null }])
  })

  it('長すぎる名前と多すぎる食材は切る', () => {
    const foods = Array.from({ length: 80 }, (_, i) => ({ name: `食材${i}`, pantryId: 'none' }))
    expect(pickFoods({ foods }, pantry)).toHaveLength(60)
    expect(pickFoods({ foods: [{ name: 'あ'.repeat(50), pantryId: 'none' }] }, pantry)[0].name).toHaveLength(
      30,
    )
  })

  it('形がおかしければ空にする', () => {
    expect(pickFoods(null, pantry)).toEqual([])
    expect(pickFoods({ foods: 'mamefu' }, pantry)).toEqual([])
  })
})

describe('AI への指示', () => {
  it('一覧に無いものも含めて、すべて書き出すよう指示する', () => {
    expect(buildPrompt(pantry)).toContain('すべて foods に書き出して')
  })

  it('pantry の id とラベルをすべて渡す', () => {
    const prompt = buildPrompt(pantry)
    expect(prompt).toContain('- dashinomoto: だしの素')
    expect(prompt).toContain('- mamefu: 豆麩')
  })
})
