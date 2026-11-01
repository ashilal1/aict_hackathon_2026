import type { Enhancement, KozuyuData, PantryItem } from '../data/types'

export type CookingStyleId = 'easy' | 'authentic' | 'custom'

export type CookingStyle = {
  id: CookingStyleId
  label: string
  lead: string
  priority: string
  recommendedIds: string[]
}

export const COOKING_STYLES: CookingStyle[] = [
  {
    id: 'easy',
    label: 'お手軽に作る',
    lead: '身近な材料と短い手順で、まず一杯',
    priority: '手に入りやすさ・短時間',
    recommendedIds: ['dashinomoto', 'oyster', 'fu', 'jagaimo', 'ninjin', 'itokon', 'kikurage'],
  },
  {
    id: 'authentic',
    label: '本格的に作る',
    lead: '干し貝柱のだしから、受け継がれてきた作り方を楽しむ',
    priority: 'だし・定番材料・前日準備',
    recommendedIds: ['kaibashira', 'hoshishiitake', 'mamefu', 'satoimo', 'ninjin', 'itokon', 'kikurage'],
  },
  {
    id: 'custom',
    label: '自分流に作る',
    lead: 'おすすめを参考に、使いたい材料を自分で決める',
    priority: '自由な組み合わせ',
    recommendedIds: [],
  },
]

export const styleById = (id: CookingStyleId) => COOKING_STYLES.find((style) => style.id === id)!

export function describeKozuyu(style: CookingStyle, checked: Set<string>, data: KozuyuData): string {
  let summary = data.lines.styleSummary[style.id]
  if (style.id === 'easy' && checked.has('kaibashira')) {
    summary = data.lines.styleSummary.easyWithKaibashira
  }
  if (style.id === 'authentic' && !checked.has('kaibashira')) {
    summary = data.lines.styleSummary.authenticWithoutKaibashira
  }
  const additions = selectedEnhancements(checked, data.enhancements)
    .filter((item) => item.pantryId !== 'kaibashira' || style.id === 'custom')
    .map((item) => item.feature)
  return [summary, ...additions].join('')
}

export function selectedEnhancements(checked: Set<string>, enhancements: Enhancement[]): Enhancement[] {
  return enhancements.filter((item) => checked.has(item.pantryId))
}

export function supplementalEnhancements(
  checked: Set<string>,
  enhancements: Enhancement[],
  templateRequires: string[],
): Enhancement[] {
  const includedInBaseSteps = new Set(templateRequires)
  return selectedEnhancements(checked, enhancements).filter((item) => !includedInBaseSteps.has(item.pantryId))
}

export function selectedItems(checked: Set<string>, pantry: PantryItem[]): PantryItem[] {
  return pantry.filter((item) => checked.has(item.id))
}
