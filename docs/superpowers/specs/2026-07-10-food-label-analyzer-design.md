# 食物营养标签分析工具 - 设计文档（v2）

## 1. 产品定位

面向普通用户（小白）的手机端 Web 工具，通过拍照识别食品包装上的营养成分表和配料表，给出**0-100 分的健康评分**和“推荐 / 适量 / 注意”等级判断。

由营养师主导设计，核心壁垒是**营养师评分引擎**，AI/OCR 只负责提取数据，判断逻辑由内置规则库完成。

## 2. MVP 范围

### 2.1 包含功能
1. 上传/拍摄食品包装照片
2. 浏览器本地 OCR 提取文字
3. 用户校对食品名称、营养成分、配料表
4. 基于三维度模型计算 0-100 分健康评分
5. 输出等级、维度得分、原因列表、配料解析
6. 历史记录本地保存

### 2.2 不做
- 个性化推荐
- 条形码扫描
- 云端同步/账号
- 后端 AI 大模型（MVP 用 Tesseract.js 本地 OCR）
- 多语言

## 3. 评分模型（100 分制）

### 3.1 总分构成

```
总分 = 配料干净度 × 0.4 + 营养质量 × 0.5 + 加工程度 × 0.1
```

| 维度 | 权重 | 满分 |
|------|------|------|
| 配料干净度 | 40% | 40 分 |
| 营养质量 | 50% | 50 分 |
| 加工程度 | 10% | 10 分 |

### 3.2 配料干净度（40 分）

**A. 配料数量（10 分）**
- ≤ 5 种：10 分
- 6-10 种：7 分
- > 10 种：4 分

**B. 添加剂风险（20 分）**
- 从 20 分开始，根据风险添加剂扣分
- 高风险：-5
- 中风险：-3
- 低风险：-2
- 最低不低于 0 分

**C. 陌生配料（10 分）**
- 默认 10 分
- 如果陌生配料 > 3 个，扣 5 分

### 3.3 营养质量（50 分）

**A. 钠（15 分）**
- < 400 mg/100g：15 分
- 400-800 mg/100g：10 分
- 800-1200 mg/100g：5 分
- ≥ 1200 mg/100g：0 分

**B. 糖（15 分）**
- < 5 g/100g：15 分
- 5-15 g/100g：10 分
- 15-25 g/100g：5 分
- ≥ 25 g/100g：0 分

**C. 脂肪质量（10 分）**
- 默认 10 分
- 反式脂肪 > 0.5 g：扣 5 分
- 饱和脂肪 ≥ 5 g：扣 3 分

**D. 能量密度（10 分）**
- < 150 kcal/100g：10 分
- 150-400 kcal/100g：5 分
- > 400 kcal/100g：0 分

### 3.4 加工程度（10 分）

检测配料表中是否含超加工关键词：
- 香精、色素、乳化剂、增稠剂、复合调味料、甜味剂、防腐剂、抗氧化剂、膨松剂、酸度调节剂

规则：
- 0-1 个：10 分
- 2-4 个：5 分
- > 4 个：2 分

### 3.5 健康等级

| 总分 | 等级 | 建议 |
|------|------|------|
| ≥ 85 | 🟢 推荐 | 配料简单，营养结构较好，可以放心选择 |
| 60-84 | 🟡 适量 | 整体可以，但需要注意摄入频率和份量 |
| < 60 | 🔴 注意 | 存在较明显营养风险，建议减少摄入 |

## 4. 数据模型

### 4.1 输入数据

```typescript
interface FoodAnalysis {
  id: string
  foodName: string
  image?: string
  servingSize: number
  servingUnit: string
  nutrientsPer100g: Nutrients
  ingredients: string[]
  rawOcrText?: string
  createdAt: number
}

interface Nutrients {
  energy: number        // kJ/100g
  protein: number       // g/100g
  fat: number           // g/100g
  saturatedFat: number  // g/100g
  transFat: number      // g/100g
  carbohydrates: number // g/100g
  sugar: number         // g/100g
  sodium: number        // mg/100g
  fiber?: number        // g/100g
}
```

### 4.2 分析结果

```typescript
interface AnalysisResult {
  id: string
  foodName: string
  createdAt: number
  totalScore: number           // 0-100
  level: 'recommended' | 'moderate' | 'caution'
  levelText: string
  suggestion: string
  dimensions: {
    ingredientCleanliness: DimensionScore
    nutritionQuality: DimensionScore
    processingLevel: DimensionScore
  }
  reasons: Reason[]
  ingredientBreakdown: IngredientInfo[]
}

interface DimensionScore {
  score: number      // 该维度得分
  maxScore: number   // 维度满分
  label: string
  details: string[]
}

interface Reason {
  type: 'positive' | 'negative'
  text: string
}

interface IngredientInfo {
  name: string
  isAdditive: boolean
  riskLevel?: 'high' | 'medium' | 'low'
  category?: string
  scoreImpact?: number
  description?: string
}
```

## 5. 技术架构

- React 19 + TypeScript + Vite + Tailwind CSS
- Tesseract.js 本地 OCR
- Zustand + localStorage
- 纯前端，无后端

## 6. 页面流程

```
首页 → 上传/拍照 → OCR 识别 → 校对数据 → 查看评分报告 → 保存历史
```

## 7. 后续迭代

1. 接入 Kimi/GPT Vision 提升 OCR 准确率
2. 扩展中国食物数据库
3. 个性化推荐
4. 条形码扫描
5. 分享卡片
