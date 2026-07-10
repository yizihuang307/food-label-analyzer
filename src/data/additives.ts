import type { ScoreLevel } from '@/types'

export interface Additive {
  name: string
  aliases: string[]
  category: string
  riskLevel: 'green' | 'yellow' | 'red'
  description: string
}

// 常见食品添加剂数据库（MVP 简化版）
export const ADDITIVES: Additive[] = [
  // 工业色素（高风险）
  {
    name: '柠檬黄',
    aliases: ['柠檬黄', '酒石黄', 'Tartrazine', 'E102'],
    category: '色素',
    riskLevel: 'red',
    description: '人工合成色素，部分研究认为可能与儿童多动有关',
  },
  {
    name: '日落黄',
    aliases: ['日落黄', '夕阳黄', 'Sunset Yellow', 'E110'],
    category: '色素',
    riskLevel: 'red',
    description: '人工合成色素，过量摄入可能引起过敏',
  },
  {
    name: '胭脂红',
    aliases: ['胭脂红', 'Ponceau 4R', 'E124'],
    category: '色素',
    riskLevel: 'red',
    description: '人工合成色素，部分人群可能过敏',
  },
  {
    name: '亮蓝',
    aliases: ['亮蓝', 'Brilliant Blue', 'E133'],
    category: '色素',
    riskLevel: 'red',
    description: '人工合成色素',
  },
  {
    name: '诱惑红',
    aliases: ['诱惑红', 'Allura Red', 'E129'],
    category: '色素',
    riskLevel: 'red',
    description: '人工合成色素',
  },
  {
    name: '焦糖色',
    aliases: ['焦糖色', 'Caramel', 'E150'],
    category: '色素',
    riskLevel: 'yellow',
    description: '常见着色剂，部分类型（III/IV）可能含少量副产物',
  },
  // 防腐剂（高风险）
  {
    name: '苯甲酸钠',
    aliases: ['苯甲酸钠', 'Benzoate', 'E211'],
    category: '防腐剂',
    riskLevel: 'red',
    description: '防腐剂，在酸性条件下可能与维生素C反应生成微量苯',
  },
  {
    name: '山梨酸钾',
    aliases: ['山梨酸钾', 'Sorbate', 'E202'],
    category: '防腐剂',
    riskLevel: 'yellow',
    description: '常用防腐剂，按规定使用相对安全',
  },
  {
    name: '亚硝酸盐',
    aliases: ['亚硝酸钠', '亚硝酸钾', 'Nitrite'],
    category: '防腐剂',
    riskLevel: 'red',
    description: '肉制品常用防腐剂，高温下可能生成亚硝胺类致癌物',
  },
  // 甜味剂（高风险）
  {
    name: '阿斯巴甜',
    aliases: ['阿斯巴甜', 'Aspartame', 'E951'],
    category: '甜味剂',
    riskLevel: 'red',
    description: '人工甜味剂，WHO 将其列为 2B 类可能致癌物（限量内风险低）',
  },
  {
    name: '安赛蜜',
    aliases: ['安赛蜜', '乙酰磺胺酸钾', 'Acesulfame K', 'E950'],
    category: '甜味剂',
    riskLevel: 'yellow',
    description: '人工甜味剂',
  },
  {
    name: '三氯蔗糖',
    aliases: ['三氯蔗糖', 'Sucralose', 'E955'],
    category: '甜味剂',
    riskLevel: 'yellow',
    description: '人工甜味剂',
  },
  // 乳化剂/增稠剂（中风险）
  {
    name: '单硬脂酸甘油酯',
    aliases: ['单硬脂酸甘油酯', 'GMS', 'Glycerol Monostearate'],
    category: '乳化剂',
    riskLevel: 'yellow',
    description: '常见乳化剂，广泛用于糕点、冰淇淋',
  },
  {
    name: '羧甲基纤维素钠',
    aliases: ['羧甲基纤维素钠', 'CMC', 'E466'],
    category: '增稠剂',
    riskLevel: 'yellow',
    description: '增稠剂，常见于饮料、乳制品',
  },
  {
    name: '黄原胶',
    aliases: ['黄原胶', 'Xanthan Gum', 'E415'],
    category: '增稠剂',
    riskLevel: 'green',
    description: '天然发酵多糖，安全性较高',
  },
  {
    name: '瓜尔胶',
    aliases: ['瓜尔胶', 'Guar Gum', 'E412'],
    category: '增稠剂',
    riskLevel: 'green',
    description: '天然植物胶',
  },
  // 抗氧化剂
  {
    name: '特丁基对苯二酚',
    aliases: ['特丁基对苯二酚', 'TBHQ', 'E319'],
    category: '抗氧化剂',
    riskLevel: 'red',
    description: '油脂抗氧化剂，高剂量可能对肝脏有负担',
  },
  {
    name: 'BHT',
    aliases: ['二丁基羟基甲苯', 'BHT', 'E321'],
    category: '抗氧化剂',
    riskLevel: 'yellow',
    description: '合成抗氧化剂',
  },
  // 酸度调节剂
  {
    name: '柠檬酸',
    aliases: ['柠檬酸', 'Citric Acid', 'E330'],
    category: '酸度调节剂',
    riskLevel: 'green',
    description: '天然有机酸，常见于柑橘类',
  },
  {
    name: '膨松剂',
    aliases: ['碳酸氢钠', '小苏打', '泡打粉', 'Baking Soda'],
    category: '膨松剂',
    riskLevel: 'green',
    description: '常见膨松剂',
  },
]

export function findAdditive(name: string): Additive | undefined {
  const normalized = name.trim().toLowerCase()
  return ADDITIVES.find((a) =>
    a.name.toLowerCase() === normalized ||
    a.aliases.some((alias) => alias.toLowerCase() === normalized)
  )
}

export function getHighestRiskLevel(levels: ScoreLevel[]): ScoreLevel {
  if (levels.includes('red')) return 'red'
  if (levels.includes('yellow')) return 'yellow'
  return 'green'
}
