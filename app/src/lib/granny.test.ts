import { describe, expect, it } from 'vitest'
import { GRANNY_FRONT, GRANNY_SPIN } from './granny'

// 画像が git に入っていないと、手元では動いても公開先でばあちゃんが消える
describe('ばあちゃんの画像', () => {
  it('止まっているときは、まっすぐ正面の画像を使う', () => {
    expect(GRANNY_FRONT).toMatch(/front\.webp/)
  })

  it('判定シーンでは、回転の動画を使う', () => {
    expect(GRANNY_SPIN).toMatch(/spin\.mp4/)
  })
})
