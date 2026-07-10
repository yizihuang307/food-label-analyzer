# 食物营养标签分析工具 - 设计文档

## 1. 项目概述

### 1.1 产品定位
面向普通用户（小白）的手机端 Web 工具，帮助用户快速判断包装食品的营养价值与配料安全性。

由营养师主导设计，把专业知识产品化，让用户不用懂营养学也能看懂食品标签。

### 1.2 目标用户
- 想吃得健康但看不懂营养成分表的普通消费者
- 需要快速对比食品的营养师/健康从业者

### 1.3 核心价值
- **不重复展示营养成分表**：直接给出判断结论
- **双维度评估**：配料干净度 与 营养健康度 分开看
- **小白友好**：用红绿灯 + 一句话结论，降低理解门槛

---

## 2. MVP 范围

### 2.1 包含功能
1. 上传/拍摄食品营养成分表照片
2. 浏览器本地 OCR 提取文字
3. 用户校对食品名称、营养成分、配料表
4. 输入单次食用份量
5. 双维度分析：
   - 配料干净度（配料数量、添加剂、工业色素等）
   - 营养健康度（钠、糖、脂肪、碳水、能量密度等）
6. 结果展示：红绿灯评级、关注项、配料解析、营养师建议
7. 历史记录本地保存

### 2.2 明确不做
- 个性化推荐（年龄/性别/体重）
- 条形码扫描
- 云端同步/账号系统
- AI 大模型分析
- 多语言支持
- 连接中国食物数据库（Demo 阶段用内置规则）

---

## 3. 用户流程

```
首页 → 上传/拍照 → OCR 识别 → 校对食品名称/营养成分/配料表
  → 输入份量 → 查看分析结果 → 保存到历史
```

---

## 4. 技术架构

### 4.1 技术栈
- **框架**：React 19 + TypeScript + Vite
- **样式**：Tailwind CSS
- **OCR**：Tesseract.js（纯浏览器运行）
- **状态管理**：Zustand
- **本地存储**：localStorage
- **部署**：静态站点（GitHub Pages / Vercel）

### 4.2 目录结构

```
food-label-analyzer/
├── public/
├── src/
│   ├── components/          # UI 组件
│   ├── pages/               # 页面
│   ├── stores/              # Zustand 状态
│   ├── engine/              # 分析引擎
│   ├── data/                # 添加剂数据库、阈值规则
│   ├── types/               # TypeScript 类型
│   ├── utils/               # 工具函数
│   ├── App.tsx
│   └── main.tsx
├── docs/superpowers/specs/  # 设计文档
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 5. 数据模型

### 5.1 FoodAnalysis（食品分析记录）

```typescript
interface FoodAnalysis {
  id: string
  foodName: string
  image?: string
  servingSize: number
  servingUnit: string
  nutrientsPer100g: Nutrients
  ingredients: string[]
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

### 5.2 AnalysisResult（分析结果）

```typescript
interface AnalysisResult {
  id: string
  foodName: string
  createdAt: number
  ingredientScore: ScoreLevel      // 'green' | 'yellow' | 'red'
  nutritionScore: ScoreLevel
  overallSuggestion: string
  warnings: Warning[]
  ingredientBreakdown: IngredientInfo[]
  nutrientHighlights: NutrientHighlight[]
}
```

---

## 6. 分析引擎规则

### 6.1 配料干净度

| 指标 | 判断标准 |
|------|---------|
| 配料数量 | ≤5 种：绿；6-10 种：黄；>10 种：红 |
| 风险添加剂 | 发现工业色素、防腐剂、甜味剂：红 |
| 一般添加剂 | 发现增稠剂、乳化剂等：黄 |
| 无添加剂 | 绿 |

**输出**：🟢 配料干净 / 🟡 配料一般 / 🔴 配料复杂

### 6.2 营养健康度

基于《中国居民膳食指南 2022》普通成年人参考值（2000 kcal 标准）。

| 营养素 | 高阈值（每 100g） | 判断 |
|--------|------------------|------|
| 钠 | ≥ 600 mg | 高钠 |
| 糖 | ≥ 15 g | 高糖 |
| 饱和脂肪 | ≥ 5 g | 高饱和脂肪 |
| 反式脂肪 | > 0 g | 含反式脂肪 |
| 能量 | ≥ 400 kcal | 高能量密度 |
| 碳水 | ≥ 60 g | 高碳水 |

**输出**：
- 🟢 可常吃：无超标项
- 🟡 适量吃：1-2 项超标
- 🔴 少吃：3 项及以上超标

### 6.3 综合建议

结合两个维度输出一句人话建议：

- 配料绿 + 营养绿 → “配料干净，营养也不错，可以放心吃”
- 配料绿 + 营养黄 → “配料比较干净，但注意控制份量”
- 配料红 + 营养红 → “添加剂多、营养风险也高，建议少吃”
- 配料黄 + 营养红 → “营养问题更突出，建议优先换一款”

---

## 7. 页面设计

### 7.1 首页
- 产品标题与一句话介绍
- 上传图片 / 拍照按钮
- 最近分析记录快捷入口

### 7.2 图片上传页
- 显示上传/拍摄的图片
- 开始 OCR 识别按钮
- 识别加载状态

### 7.3 OCR 校对页
- 食品名称输入框
- 营养成分表单（可编辑）
- 配料表输入框（支持粘贴多行）
- 份量输入
- 开始分析按钮

### 7.4 分析结果页
- 食品名称
- 双维度红绿灯卡片
- 关注项列表
- 配料解析（标出添加剂）
- 营养师建议
- 保存 / 重新分析按钮

### 7.5 历史记录页
- 按时间倒序展示过往分析
- 可点击查看详情
- 可删除记录

---

## 8. 错误处理

| 场景 | 处理方式 |
|------|---------|
| OCR 失败 | 显示原图，提示手动输入 |
| 解析失败 | 直接展示可编辑表单 |
| 营养成分缺失 | 仅计算可用数据，提示“部分数据缺失，结果仅供参考” |
| 添加剂匹配不到 | 标为“未知成分”，建议用户留意 |

---

## 9. 隐私说明

- 所有图片和计算均在浏览器本地完成
- 不上传任何图片到服务器
- 历史记录保存在用户本机 localStorage

---

## 10. 后续迭代方向

1. 接入中国食物数据库，按具体食品类型给出更精准阈值
2. 个性化推荐（年龄、性别、体重、活动量）
3. 条形码扫描
4. AI 配料表解析
5. 数据导出/分享卡片
