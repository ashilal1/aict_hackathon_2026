import { describe, expect, it } from 'vitest'
import { cookingStepsFor, effortById } from './effort'

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
