import { describe, expect, it } from 'vitest'
import { GRANNY_FRAMES, GRANNY_FRONT } from './granny'

// 画像が git に入っていないと、手元では動いても公開先でばあちゃんが消える
describe('ばあちゃんの画像', () => {
  it('正面の高さで一周する 36 枚がそろっている', () => {
    expect(GRANNY_FRAMES).toHaveLength(36)
    expect(GRANNY_FRONT).toMatch(/e\+00_a000\.webp/)
  })
})
