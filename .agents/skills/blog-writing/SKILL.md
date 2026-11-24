---
name: blog-writing
description: "Write, revise, translate, or publish articles for this bilingual MDX blog. Use when the user asks for a blog post, research article, draft, translation, or publication under content/blog/. Enforces reading the writing contract first, drafting one Chinese version first, and translating only after the Chinese draft is settled."
---

# Blog Writing

本 skill 规定本仓库的文章写作流程。发布站点以英文为主，但新文章的默认创作顺序是：**先核对写作约定，再写一份中文草稿，最后翻译英文**。不要一开始就同时生成 `zh.mdx` 和 `en.mdx`。

## 何时使用

- 用户要求调研、撰写、续写、改写、翻译或发布 `content/blog/<slug>/` 下的文章。
- 用户给一个主题但没有给草稿。
- 用户要求基于现有中文或英文稿生成另一语言版本。

## 第 0 步：核对写作 flow（必须，先于任何草稿）

按顺序阅读：

1. `README.md` 的 `Write and publish`、`Article TL;DR`、`Built-in Fumadocs authoring features`。
2. `review-rules/` 下的全部规则。
3. 已有文章（若有）的 frontmatter、标题层级、TLDR、链接和图片写法；优先参考同类型文章。
4. 需要改元数据或组件时，再读 `src/lib/schema.ts`、`src/components/blog/mdx.tsx` 和 `scripts/validate-content.ts`。

核对后在内部确认以下事项，再开始写：

- 稳定 slug 和目录名
- 目标读者与阅读目标
- 一个主结论
- 支撑结论的证据、来源和不确定性
- 文章类型与范围（哪些内容不写）
- 是否需要 TLDR、图表、交互组件或代码

其中任何一项无法从用户输入或资料中确定，先问用户。不要用猜测补全范围、数据或引用。

## 第 1 步：只写中文草稿

创建：

```text
content/blog/<stable-slug>/zh.mdx
```

frontmatter 至少包含：

```yaml
---
title: "..."
description: "..."
slug: <stable-slug>
lang: zh
status: draft
date: "YYYY-MM-DD"
tags: [...]
---
```

要求：

- `slug` 与目录名一致，`lang` 与文件名一致。
- 默认 `status: draft`；没有用户明确同意，不得改成 `published`。
- 这一轮**不要创建 `en.mdx`**，也不要先写英文再翻译成中文。
- 先写清楚问题、主结论和证据链，再补细节；不要让调研笔记原样进入正文。
- 关键事实、数字、版本和引文要么有来源，要么明确标注不确定。
- TLDR 用中文写，放在第一节之前；在正文主结论和证据稳定后回填，不要先写一个无法被正文支撑的摘要。TLDR 最多 120 个语义单位（每个英文/数字词或中日韩字符计 1），由 `npm run validate` 检查。
- 遵守 `review-rules/`：前三段建立主题，先整体后细节，段首句点题，句间逻辑连续，术语统一，单一主结论，TLDR 自包含，表格和图片服务于论点。
- 用 reverse-outlining 自查：给每段写一句话意图，再把它们连成提纲；如果提纲不能组成预期论证，先改段落结构。

如果用户明确要求先写英文或其他语言，以用户要求为准；否则默认中文先行。

## 第 2 步：验证中文草稿并停下

至少运行：

```sh
npm run format
npm run validate
```

内容或组件有改动时，再运行：

```sh
npm run build
```

完成后向用户报告：

- 草稿路径
- 文章的主要结论和结构
- 尚未解决的问题或缺失来源
- 下一步建议（修改中文稿 / 翻译英文）

**停在这里等用户反馈。** 中文稿未确认前不要创建英文稿。

## 第 3 步：中文稿确认后再翻译

用户确认中文内容后，再创建：

```text
content/blog/<stable-slug>/en.mdx
```

要求：

- 与中文稿相同的 `slug`，`lang: en`。
- 默认仍为 `status: draft`，除非用户明确要求发布。
- 按语义翻译，不逐句硬译；术语、数字、引用和限定条件必须与中文稿一致。
- TLDR、标题和描述用英文重写，不保留中文。
- 中文稿后续有实质修改时，同步更新英文稿。

## 第 4 步：最终检查

提交或交付前运行：

```sh
npm run format:check
npm run lint
npm run validate
npm test
npm run typecheck
npm run build
npm run test:export
```

只改 Markdown 时至少运行 `npm run format:check` 和 `npm run validate`；能运行完整检查时优先运行完整检查。

## 发布规则

- 发布需要用户明确同意；默认保持 `draft`。
- 两种语言不要求同时发布；未发布语言不会出现在路由、列表或 alternate 元数据中。
- PR 描述必须关联对应 issue。
- 不把密钥、内部地址或未公开材料写进 `content/`；draft 不是保密边界。

## 禁止事项

- 不要在同一轮同时创建中英文两份调研草稿。
- 不要在中文稿未确认时先翻译英文。
- 不要未读 `README.md` 和 `review-rules/` 就直接写正文。
- 不要编造引用、数据、实验结果或不存在的来源。
- 不要在用户未同意时发布或合并。
