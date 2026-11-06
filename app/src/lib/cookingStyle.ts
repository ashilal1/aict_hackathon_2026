export type CookingStyleId = 'easy' | 'authentic' | 'custom'

export type CookingStyle = {
  id: CookingStyleId
  label: string
  lead: string
  priority: string
}

export const COOKING_STYLES: CookingStyle[] = [
  {
    id: 'easy',
    label: 'お手軽に作るべ',
    lead: '身近な材料と短い手順で、\nまず一杯作るべ',
    priority: '手に入りやすさ・短時間',
  },
  {
    id: 'authentic',
    label: '本格的に作るべ',
    lead: '干し貝柱のだしから、\n受け継がれてきた作り方を楽しむべ',
    priority: 'だし・定番材料・前日準備',
  },
  {
    id: 'custom',
    label: '自分流に作るべ',
    lead: 'おすすめを見ながら、\n使いてえ材料を自分で決めっせ',
    priority: '自由な組み合わせ',
  },
]
