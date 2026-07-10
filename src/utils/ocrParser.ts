import type { Nutrients } from '@/types'

export interface ParsedLabel {
  foodName?: string
  nutrients: Partial<Nutrients>
  ingredients: string[]
  confidence: number
}

const NUTRIENT_PATTERNS: { key: keyof Nutrients; patterns: RegExp[] }[] = [
  {
    key: 'energy',
    patterns: [
      /能量[^\d]*(\d+(?:\.\d+)?)\s*(?:千焦|kJ|kj|KJ)/i,
      /热量[^\d]*(\d+(?:\.\d+)?)\s*(?:千焦|kJ|kj|KJ)/i,
      /能量[^\d]*(\d+(?:\.\d+)?)\s*(?:千焦|kJ|kj|KJ)/i,
    ],
  },
  {
    key: 'protein',
    patterns: [
      /蛋白质[^\d]*(\d+(?:\.\d+)?)\s*g/i,
      /蛋白[^\d]*(\d+(?:\.\d+)?)\s*g/i,
    ],
  },
  {
    key: 'fat',
    patterns: [
      /脂肪[^\d]*(\d+(?:\.\d+)?)\s*g/i,
      /总脂肪[^\d]*(\d+(?:\.\d+)?)\s*g/i,
    ],
  },
  {
    key: 'saturatedFat',
    patterns: [
      /饱和脂肪[^\d]*(\d+(?:\.\d+)?)\s*g/i,
    ],
  },
  {
    key: 'transFat',
    patterns: [
      /反式脂肪[^\d]*(\d+(?:\.\d+)?)\s*g/i,
      /反式脂肪酸[^\d]*(\d+(?:\.\d+)?)\s*g/i,
    ],
  },
  {
    key: 'carbohydrates',
    patterns: [
      /碳水化合物[^\d]*(\d+(?:\.\d+)?)\s*g/i,
      /碳水[^\d]*(\d+(?:\.\d+)?)\s*g/i,
    ],
  },
  {
    key: 'sugar',
    patterns: [
      /糖[^\d]*(\d+(?:\.\d+)?)\s*g/i,
      /添加糖[^\d]*(\d+(?:\.\d+)?)\s*g/i,
    ],
  },
  {
    key: 'sodium',
    patterns: [
      /钠[^\d]*(\d+(?:\.\d+)?)\s*mg/i,
    ],
  },
  {
    key: 'fiber',
    patterns: [
      /膳食纤维[^\d]*(\d+(?:\.\d+)?)\s*g/i,
      /纤维[^\d]*(\d+(?:\.\d+)?)\s*g/i,
    ],
  },
]

function extractNumber(text: string, patterns: RegExp[]): number | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const value = Number.parseFloat(match[1])
      if (!Number.isNaN(value)) return value
    }
  }
  return undefined
}

function extractFoodName(text: string): string | undefined {
  // 尝试从文本前几行找食品名称（通常是最长或最显眼的文字）
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean)
  // 优先找包含“净含量”、“规格”等前的文字，或直接取第一行非空行
  for (const line of lines.slice(0, 5)) {
    if (line.length >= 2 && line.length <= 20 && !/营养|成分|每100|NRV|能量|蛋白质|脂肪|碳水|钠|糖|mg|g/.test(line)) {
      return line
    }
  }
  return undefined
}

function extractIngredients(text: string): string[] {
  // 找“配料”或“配料表”后面的内容
  const match = text.match(/配料(?:表)?[：:]\s*([\s\S]*?)(?:\n{2,}|营养成分|$)/)
  if (!match) return []
  const ingredientText = match[1].replace(/\s+/g, ' ').trim()
  if (!ingredientText) return []
  // 按中文逗号、顿号、英文逗号分割
  return ingredientText.split(/[,，、]/).map((i) => i.trim()).filter(Boolean)
}

export function parseNutritionLabel(text: string): ParsedLabel {
  const normalizedText = text.replace(/\s+/g, ' ').trim()
  const nutrients: Partial<Nutrients> = {}

  for (const { key, patterns } of NUTRIENT_PATTERNS) {
    const value = extractNumber(normalizedText, patterns)
    if (value !== undefined) {
      nutrients[key] = value
    }
  }

  // 能量单位转换：如果是 kcal 标注，转成 kJ
  if (nutrients.energy === undefined) {
    const kcalMatch = normalizedText.match(/能量[^\d]*(\d+(?:\.\d+)?)\s*(?:千卡|kcal|大卡)/i)
    if (kcalMatch) {
      nutrients.energy = Math.round(Number.parseFloat(kcalMatch[1]) * 4.184)
    }
  }

  const ingredients = extractIngredients(text)

  // 置信度：根据成功提取的营养素数量
  const found = Object.values(nutrients).filter((v) => v !== undefined).length
  const confidence = Math.min(found / 5, 1)

  return {
    foodName: extractFoodName(text),
    nutrients,
    ingredients,
    confidence,
  }
}

export function getDefaultNutrients(): Nutrients {
  return {
    energy: 0,
    protein: 0,
    fat: 0,
    saturatedFat: 0,
    transFat: 0,
    carbohydrates: 0,
    sugar: 0,
    sodium: 0,
    fiber: 0,
  }
}
