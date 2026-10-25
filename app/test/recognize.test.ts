import { describe, expect, it } from 'vitest'
import { MAX_IMAGES, buildPrompt, parseImages, pickKnownIds } from '../api/recognize.ts'

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
    expect(parseImages({})).toBe('写真がありません')
    expect(parseImages({ images: Array(MAX_IMAGES + 1).fill(image) })).toBe('写真は 3 枚までです')
    expect(parseImages({ images: [{ ...image, mediaType: 'image/gif' }] })).toBe('写真の形式が読めません')
    expect(parseImages({ images: [{ ...image, data: '' }] })).toBe('写真が空です')
  })
})

describe('判定結果の受け取り', () => {
  it('pantry に無い id と重複は捨てる', () => {
    expect(pickKnownIds({ ids: ['mamefu', 'kombu', 'mamefu', 3] }, pantry)).toEqual(['mamefu'])
  })

  it('形がおかしければ空にする', () => {
    expect(pickKnownIds(null, pantry)).toEqual([])
    expect(pickKnownIds({ ids: 'mamefu' }, pantry)).toEqual([])
  })
})

describe('AI への指示', () => {
  it('pantry の id とラベルをすべて渡す', () => {
    const prompt = buildPrompt(pantry)
    expect(prompt).toContain('- dashinomoto: だしの素')
    expect(prompt).toContain('- mamefu: 豆麩')
  })
})
