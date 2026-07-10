// 超加工关键词：配料表中出现这些词，说明加工程度较高
export const PROCESSING_KEYWORDS = [
  '香精',
  '色素',
  '乳化剂',
  '增稠剂',
  '复合调味料',
  '甜味剂',
  '防腐剂',
  '抗氧化剂',
  '膨松剂',
  '酸度调节剂',
  '稳定剂',
  '凝固剂',
  '被膜剂',
  '胶基糖果中基础剂',
  '湿润剂',
  '抗结剂',
  '消泡剂',
  '漂白剂',
  '护色剂',
  '酶制剂',
  '面粉处理剂',
  '水分保持剂',
  '营养强化剂',
  '凝固剂',
  '催化剂',
  '加工助剂',
]

export function countProcessingKeywords(ingredients: string[]): number {
  return ingredients.reduce((count, ingredient) => {
    const hasKeyword = PROCESSING_KEYWORDS.some((keyword) =>
      ingredient.includes(keyword)
    )
    return hasKeyword ? count + 1 : count
  }, 0)
}
