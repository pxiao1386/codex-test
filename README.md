# 直播英语训练助手 (Live Seller English Coach)

面向中国跨境卖家的移动优先英语训练 MVP。UI 全中文，学习内容为美式直播英语。

## 技术栈

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- OpenAI Node SDK

## 功能页

1. **首页**：今日练习入口（开始练习、模拟观众提问、帮我改句子、复习错误）
2. **直播英语句子练习**：6 大分类句库，句子含英文、中文、使用时机、自然表达、短句表达、中文解释
3. **模拟直播观众提问**：AI 模拟美国观众提问，返回评分和改进建议
4. **帮我改句子**：输入中文或英文，返回直播可用表达
5. **复习错误**：按错误类型复盘

## 数据模型

Prisma 模型：
- User
- PhraseCategory
- Phrase
- PracticeRecord
- Scenario
- LiveSession
- LiveTurn
- Favorite

## 种子数据

- 6 个句子分类
- 80 条短句
- 10 个直播场景

## API

- `GET /api/phrases`
- `GET /api/phrases/practice`
- `POST /api/live/start`
- `POST /api/live/reply`
- `POST /api/rewrite`
- `GET /api/review/issues`
- `POST /api/tts`

## 本地运行

```bash
npm install
cp .env.example .env
# 配置 DATABASE_URL 与 OPENAI_API_KEY
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

打开 http://localhost:3000

## OpenAI 说明

- API Key 仅在服务端读取（`lib/openai.ts`）
- 前端不会暴露 `OPENAI_API_KEY`
- 若未配置 key，部分 API 会走安全降级返回示例结果

## 视觉风格

使用米白、浅粉、淡紫配色，整体柔和、治愈、轻女性化。
