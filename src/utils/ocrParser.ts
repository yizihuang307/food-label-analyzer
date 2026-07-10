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
      /能量[\s:：]*([\d.]+)\s*(?:千焦|kJ|kj|KJ)/i,
      /热量[\s:：]*([\d.]+)\s*(?:千焦|kJ|kj|KJ)/i,
      /能量[\s:：]*([\d.]+)\s*(?:千卡|kcal|大卡|千焦|kJ)/i,
    ],
  },
  {
    key: 'protein',
    patterns: [
      /蛋白质[\s:：]*([\d.]+)\s*(?:g|克)/i,
      /蛋白[\s:：]*([\d.]+)\s*(?:g|克)/i,
    ],
  },
  {
    key: 'fat',
    patterns: [
      /脂肪[\s:：]*([\d.]+)\s*(?:g|克)/i,
      /总脂肪[\s:：]*([\d.]+)\s*(?:g|克)/i,
    ],
  },
  {
    key: 'saturatedFat',
    patterns: [
      /饱和脂肪[\s:：]*([\d.]+)\s*(?:g|克)/i,
    ],
  },
  {
    key: 'transFat',
    patterns: [
      /反式脂肪[\s:：]*([\d.]+)\s*(?:g|克)/i,
      /反式脂肪酸[\s:：]*([\d.]+)\s*(?:g|克)/i,
    ],
  },
  {
    key: 'carbohydrates',
    patterns: [
      /碳水化合物[\s:：]*([\d.]+)\s*(?:g|克)/i,
      /碳水[\s:：]*([\d.]+)\s*(?:g|克)/i,
    ],
  },
  {
    key: 'sugar',
    patterns: [
      /糖[\s:：]*([\d.]+)\s*(?:g|克)/i,
      /添加糖[\s:：]*([\d.]+)\s*(?:g|克)/i,
    ],
  },
  {
    key: 'sodium',
    patterns: [
      /钠[\s:：]*([\d.]+)\s*(?:mg|毫克)/i,
    ],
  },
  {
    key: 'fiber',
    patterns: [
      /膳食纤维[\s:：]*([\d.]+)\s*(?:g|克)/i,
      /纤维[\s:：]*([\d.]+)\s*(?:g|克)/i,
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
  // 优先从“产品名称”提取
  const productNameMatch = text.match(/产品名称[：:]\s*(.+)/i)
  if (productNameMatch) {
    const name = productNameMatch[1].trim().split(/\n/)[0].trim()
    if (name.length >= 2 && name.length <= 40) return name
  }

  // 尝试从文本前几行找食品名称
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean)
  for (const line of lines.slice(0, 8)) {
    if (line.length >= 2 && line.length <= 24 && !/营养|成分|每100|NRV|能量|蛋白质|脂肪|碳水|钠|糖|mg|g|千焦|大卡|配料|产品类型|产品名称|执行标准|净含量|生产日期|保质期|产地|储存/.test(line)) {
      return line
    }
  }
  return undefined
}

function extractIngredients(text: string): string[] {
  // 匹配“配料”或“配料表”后面的内容，直到空行或“营养成分”
  const match = text.match(/配料(?:表)?[：:]\s*([\s\S]*?)(?:\n{2,}|营养成分|项目|$)/i)
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

  // 能量单位转换：如果是 kcal/千卡 标注，转成 kJ
  if (nutrients.energy === undefined) {
    const kcalMatch = normalizedText.match(/能量[\s:：]*([\d.]+)\s*(?:千卡|kcal|大卡)/i)
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
