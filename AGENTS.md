# Repository Instructions

## Blog writing workflow

This repository keeps its authoring workflow in `.agents/skills/blog-writing/SKILL.md`. Read and follow that skill before creating or changing anything under `content/blog/`.

The default sequence is:

1. Read the authoring sections of `README.md` and every `review-rules/*.md` file.
2. Pass the topic-quality gate: require an original contribution beyond summary, plus information gain that supports a technical decision or an evidence-backed conclusion.
3. Confirm the slug, audience, one main conclusion, evidence, and scope.
4. Create only `content/blog/<slug>/zh.mdx` with `lang: zh` and `status: draft`.
5. Validate the Chinese draft and stop for review.
6. After the Chinese draft is settled, create `en.mdx` and validate again.
7. Publish only with explicit approval.

Do not create bilingual drafts in one pass. Do not translate before the Chinese draft is settled.
