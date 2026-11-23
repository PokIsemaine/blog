# Repository Instructions

## Blog writing workflow

This repository keeps its authoring workflow in `.agents/skills/blog-writing/SKILL.md`. Read and follow that skill before creating or changing anything under `content/blog/`.

The default sequence is:

1. Read the authoring sections of `README.md` and every `review-rules/*.md` file.
2. Confirm the slug, audience, one main conclusion, evidence, and scope.
3. Create only `content/blog/<slug>/zh.mdx` with `lang: zh` and `status: draft`.
4. Validate the Chinese draft and stop for review.
5. After the Chinese draft is settled, create `en.mdx` and validate again.
6. Publish only with explicit approval.

Do not create bilingual drafts in one pass. Do not translate before the Chinese draft is settled.
