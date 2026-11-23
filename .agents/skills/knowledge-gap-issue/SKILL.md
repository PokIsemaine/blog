---
name: knowledge-gap-issue
description: Use when the user says they do not understand a concept during discussion ("不懂", "没听过", "这是什么") and it is unclear whether it belongs in the current article or needs a standalone systematic introduction; capture the latter as a GitHub issue without derailing the current task.
---

# Knowledge-Gap Issue

Turn a durable unknown into a tracked writing topic while keeping the current discussion moving.

## Recognize the Signal

Phrases such as "不懂", "没听过", "这是什么", "第一次见", "不了解", "没接触过", and "I don't know X" may mark a knowledge gap worth researching. They are signals, not automatic commands: the user may want a quick answer, or may be flagging a topic for later.

Do not create an issue when the gap is:

- a temporary debugging question ("why is this value null?"),
- a one-off command, flag, configuration value, or error message,
- private repository behavior with no reusable public explanation,
- already answered in the conversation,
- already covered by an open or closed issue, or a published article.

For a direct question, give the shortest answer that unblocks the current discussion. Creating an issue does not replace that answer.

## Decide Whether It Deserves an Issue

Create an issue when at least three of these are true:

1. It is a concept or mechanism with internal structure, not a single fact.
2. Explaining it properly needs more than two or three paragraphs.
3. It is likely to recur in the user's reading, writing, or engineering work.
4. Public documentation, papers, specifications, or implementations exist to study.
5. It fits the blog's systems, AI, or robotics scope.

If fewer than three hold, do not create an issue. Link an existing explanation when one exists, then continue the original task. Do not create speculative "maybe useful" issues.

## Same Article or Standalone Topic

Before creating an issue, decide where the explanation belongs:

| Fit                                                                                     | Action                                                                                                          |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| One sentence, paragraph, or short subsection in the current article is enough           | Do not create an issue. Add it to the current outline or draft, or tell the user exactly where it fits.         |
| It needs its own problem statement, mechanism, comparisons, failure modes, and evidence | Create a separate issue for a systematic introduction.                                                          |
| The current task is not an article                                                      | Use the depth and reuse criteria above; create an issue only when the concept would support a standalone piece. |

Use these tests to separate the two:

- **Same article:** the concept only explains a local "why" or "what" needed to follow the current argument. Removing it does not change the article's main conclusion, and one paragraph or subsection restores the missing context.
- **Standalone topic:** the concept has its own design space, competing approaches, tradeoffs, and evaluation questions. It would dominate the current article or require the reader to learn a separate body of background first.

When the concept is only a supporting detail, put a short explanation or TODO in the current article instead of opening a new issue. Record the chosen placement in the response so the user can see why it was not split out.

## Workflow

1. **Name the topic precisely.** Use the term the user used, plus a short disambiguation if the term is overloaded. Do not broaden it into a survey.
2. **Resolve the target repository.** Prefer the current repository. In this blog workspace, the target is `PokIsemaine/blog`.

   ```bash
   target_repo="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
   ```

3. **Check for duplicates.** Search issues and existing articles before creating anything:

   ```bash
   gh issue list --repo "$target_repo" --state all \
     --search "<distinctive term> in:title,body" --limit 20 \
     --json number,title,state,url

   rg -n -i "<distinctive term>" content/blog || true
   ```

   If an issue or article already covers the topic, report its URL and do not create a duplicate. If the existing issue is closed and the user wants to revisit it, suggest reopening it or adding a comment.

4. **Write the issue.** Match the conversation language; this blog's existing issues use Chinese. Keep the title concise and use the repository's `调研 <topic>` convention. Write the body to a unique temporary file and pass it with `--body-file`:

   ```markdown
   ## 背景

   在讨论「<current context>」时，用户表示不了解 **<topic>**。

   ## 为什么值得单独研究

   <2-3 sentences: what problem it addresses, what decisions or systems it affects,
   why a short inline answer is insufficient, and why a subsection in the current
   article cannot cover it.>

   ## 与当前文章的关系

   - 定位：独立系统性介绍
   - 不能并入当前文章的原因：<why the current article cannot absorb it>

   ## 拟调研问题

   - <question 1>
   - <question 2>
   - <question 3>

   ## 预期产出

   一篇可发布文章，至少回答：

   - 它解决什么问题，核心机制是什么
   - 与相邻方案的边界和主要取舍
   - 哪些证据或最小实验能支持结论
   - 哪些场景不适用

   ## 范围

   - 包含：<in scope>
   - 不包含：<out of scope>

   ## 起始资料

   - <verified link, or "待补充">
   ```

   Only include sources you have verified. Never invent citations, benchmark numbers, or claims. If the discussion came from another issue or PR, add `Related: #<number>`. If the concept belongs in the current article instead, do not use this template or create an issue.

5. **Create the issue.**

   ```bash
   body_file="$(mktemp /tmp/knowledge-gap-issue.XXXXXX.md)"
   # Write the filled issue body to "$body_file".
   gh issue create --repo "$target_repo" \
     --title "调研 <topic>" \
     --body-file "$body_file"
   ```

6. **Report and resume.** Reply with the issue URL, the one-line reason it cleared the bar, and then continue the original task. Do not turn the issue into an immediate research detour unless the user asks for one.

## Guardrails

- Do not create more than one issue for the same gap in a conversation.
- Do not copy secrets, private URLs, customer data, or large blocks of source text into an issue.
- Keep the issue focused on one concept; split unrelated questions into separate issues.
- If `gh` is unavailable or unauthenticated, leave the drafted body at a temporary path and report that the issue was not created. Never claim success without a returned issue URL.
