import { describe, expect, it } from 'vitest'
import { GRANNY_FRONT, SPIN_KEYFRAMES, easeSpin, frameFor, midUrl, spinBlend, spinFade } from './granny'

// 画像が git に入っていないと、手元では動いても公開先でばあちゃんが消える
describe('ばあちゃんの画像', () => {
  it('止まっているときは、まっすぐ正面の画像を使う', () => {
    expect(GRANNY_FRONT).toMatch(/front\.webp/)
  })

  it('回る途中で使う画像が、すべて 768px 版にある', () => {
    const missing = SPIN_KEYFRAMES.filter((view) => view && midUrl(view.file) === undefined)
    expect(missing).toEqual([])
  })
})

describe('回り方', () => {
  it('正面の画像で始まり、正面の画像で止まる', () => {
    const last = SPIN_KEYFRAMES.length - 1
    expect(SPIN_KEYFRAMES[0]).toBeNull()
    expect(SPIN_KEYFRAMES[last]).toBeNull()
    expect(spinBlend(0)).toEqual({ from: 0, to: 1, fade: 0 })
    expect(spinBlend(1)).toEqual({ from: last - 1, to: last, fade: 1 })
  })

  it('途中で止まらず、等速の間は 1 段が長くならない', () => {
    let previous = 0
    for (let i = 1; i <= 1000; i++) {
      const eased = easeSpin(i / 1000)
      expect(eased).toBeGreaterThan(previous)
      previous = eased
    }
    expect(easeSpin(0)).toBe(0)
    expect(easeSpin(1)).toBe(1)
    expect(easeSpin(0.5)).toBeCloseTo(0.5)
    expect(easeSpin(0.3) - easeSpin(0.2)).toBeCloseTo(easeSpin(0.6) - easeSpin(0.5))
  })

  it('添字は 1 段ずつ順に進む', () => {
    let previous = 0
    for (let i = 1; i <= 1000; i++) {
      const { from, to } = spinBlend(i / 1000)
      expect(to).toBe(from + 1)
      expect(from).toBeGreaterThanOrEqual(previous)
      previous = from
    }
  })

  it('画像が混ざるのは、幅の分だけ', () => {
    expect(spinFade(0.2, 0.5)).toBe(0)
    expect(spinFade(0.5, 0.5)).toBe(0.5)
    expect(spinFade(0.8, 0.5)).toBe(1)
    expect(spinFade(0.25, 1)).toBe(0.25)
  })

  it('最後の手前は、正面の画像に近い方位の画像を通る', () => {
    expect(SPIN_KEYFRAMES.at(-2)).toEqual({ file: 'e-10_a350.webp', rot: 0 })
  })

  it('真上を越えると裏側に回り込み、上下が逆さになる', () => {
    expect(frameFor(0, 120)).toEqual({ file: 'e+60_a180.webp', rot: 180 })
  })

  it('真上・真下では極の画像を使う', () => {
    expect(frameFor(0, 90).file).toBe('e+89_a000.webp')
    expect(frameFor(0, -90).file).toBe('e-89_a000.webp')
  })
})
