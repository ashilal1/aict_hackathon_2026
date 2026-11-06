import { describe, expect, it } from 'vitest'
import { cookingStepsFor, effortById, effortFor, withPreparation } from './effort'

describe('出汁にかける時間ごとの仮手順', () => {
  const recipeSteps = ['前の晩に、干し貝柱を水に浸けて戻す', '具を小さく切る', '鍋で煮る']

  it('選んだ出汁工程を最初に出す', () => {
    const effort = effortById('quick')
    expect(cookingStepsFor(recipeSteps, effort)[0]).toBe(effort.dashiMethod)
  })

  it('既存の前日工程と、新しい出汁工程を重複させない', () => {
    const steps = cookingStepsFor(recipeSteps, effortById('careful'))
    expect(steps.filter((step) => step.includes('前の晩に')).length).toBe(0)
    expect(steps).toHaveLength(recipeSteps.length)
  })
})

describe('作り方と材料から決まる出汁の取り方', () => {
  it('お手軽は出汁を取らず、本格的と自分流は短時間で作る', () => {
    expect(effortFor('easy', new Set(['dashinomoto']))).toBe('quick')
    expect(effortFor('authentic', new Set(['hotate_can']))).toBe('standard')
    expect(effortFor('custom', new Set())).toBe('standard')
  })

  it('干し貝柱を選んでいれば、どの作り方でも前日から取る', () => {
    expect(effortFor('easy', new Set(['kaibashira']))).toBe('careful')
    expect(effortFor('authentic', new Set(['kaibashira']))).toBe('careful')
    expect(effortFor('custom', new Set(['kaibashira']))).toBe('careful')
  })
})

describe('材料ごとの下ごしらえ', () => {
  const steps = ['具を小さく切る', '鍋で煮る']

  it('里芋を選んだら、下ゆでを手順の前に足す', () => {
    expect(withPreparation(steps, new Set(['satoimo']))[0]).toContain('下ゆで')
  })

  it('麩を選んだら、最後に入れる手順を足す', () => {
    for (const id of ['mamefu', 'fu']) {
      expect(withPreparation(steps, new Set([id])).at(-1)).toContain('最後に麩を入れて')
    }
  })

  it('里芋も麩もなければ、手順は変えない', () => {
    expect(withPreparation(steps, new Set(['ninjin']))).toEqual(steps)
  })
})
