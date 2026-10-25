import { describe, expect, it } from 'vitest'
import { GRANNY_FRAMES, GRANNY_FRONT, frameFor, smallUrl, spinFiles, spinView } from './granny'

// 画像が git に入っていないと、手元では動いても公開先でばあちゃんが消える
describe('ばあちゃんの画像', () => {
  it('正面の高さで一周する高画質の 36 枚がそろっている', () => {
    expect(GRANNY_FRAMES).toHaveLength(36)
    expect(GRANNY_FRONT).toMatch(/e\+00_a000\.webp/)
  })

  it('回る途中で使う画像が、すべて小さい版にある', () => {
    const missing = spinFiles().filter((file) => smallUrl(file) === undefined)
    expect(missing).toEqual([])
  })
})

describe('回り方', () => {
  it('正面から始まって正面で止まる', () => {
    expect(spinView(0)).toEqual({ file: 'e+00_a000.webp', rot: 0 })
    expect(spinView(1)).toEqual({ file: 'e+00_a000.webp', rot: 0 })
  })

  it('真上を越えると裏側に回り込み、上下が逆さになる', () => {
    expect(frameFor(0, 120)).toEqual({ file: 'e+60_a180.webp', rot: 180 })
  })

  it('真上・真下では極の画像を使う', () => {
    expect(frameFor(0, 90).file).toBe('e+89_a000.webp')
    expect(frameFor(0, -90).file).toBe('e-89_a000.webp')
  })
})
