# Systems Notebook

A Git-first, English-first technical publication. Next.js App Router renders Fumadocs MDX **at build time**. GitHub Pages serves only the resulting HTML, CSS, JavaScript and assets. There are no API routes, server actions, authentication services, or runtime application servers.

## Quick start

Requires Node.js 24 and Git. This folder is the **repository root**: copy its contents (including `.github`) into your GitHub repository, not into a nested `outputs/` folder.

```sh
npm ci
npm run dev
```

Open http://localhost:3000/en/. For local environment configuration, copy `.env.example` to `.env.local`. Next loads `.env.local`; standalone `tsx` validation/export/review scripts use shell environment variables, so export matching values before testing a configured build. Never commit credentials.

```sh
npm run format:check
npm run lint
npm run validate
npm test
npm run typecheck
npm run build
npm run test:export
```

`npm run format` fixes formatting. `npm run build` validates metadata and compiles every MDX file before exporting to `out/`. `next start` is not used. Serve `out/` with any static web server. For a subpath build, mount that directory under the same subpath.

PowerShell project-site test:

```powershell
$env:NEXT_PUBLIC_BASE_PATH = '/my-repository'
$env:NEXT_PUBLIC_SITE_URL = 'https://username.github.io'
npm run build
npm run test:export
# Clear these for domain-root builds:
Remove-Item Env:NEXT_PUBLIC_BASE_PATH
Remove-Item Env:NEXT_PUBLIC_SITE_URL
```

## Write and publish

Create `content/blog/<stable-id>/en.mdx`. Translations live beside it as `zh.mdx` and use the **same slug**. A slug is both URL identity and discussion identity: treat it as permanent. No requirement couples publication status across languages.

```mdx
---
title: "How a Buffer Pool Works"
description: "Follow a page through an in-memory cache."
slug: buffer-pool
lang: en
status: published
date: "2026-10-19"
tags: [Databases]
---

import { IndexDemo } from "@/components/interactive/index-demo";

## A small experiment

<IndexDemo />
```

All metadata fields above except tags are required; date must be a quoted, valid ISO calendar date. Slug and language must match directory and filename. `status: draft` excludes a document from public routes, lists and alternate metadata. Dates are editorial dates, not a scheduling mechanism. Drafts still must compile and have valid metadata. Drafts are **not a confidentiality boundary**: keep confidential writing outside a public repository.

Use `##` and `###` headings for the generated table of contents; the page template supplies the article title. Fumadocs provides heading IDs and Shiki code highlighting. Put browser interaction in `src/components/interactive/` with `'use client'`, and reusable deterministic calculations in separate `.ts` modules. Components can render SVG diagrams, canvas plots or browser-only demonstrations without a backend. Add explicit component imports to MDX rather than putting implementations in articles.

Use root-relative site links such as `[another article](/en/blog/database-index/)`; the article renderer prefixes the configured repository base path. Use `SiteLink` in React components. For static assets in `public/`, use `withBase('/asset.svg')` from `src/components/blog/site-link.tsx` rather than hardcoding a domain or repository name. Markdown images in MDX use `ArticleImage`, which applies `withBase` automatically. Avoid relative image URLs, runtime Next image optimization, remote build-time fonts, and server features.

Published pages use `/en/blog/<slug>/` and `/zh/blog/<slug>/`. The language switcher appears only when a published translation exists; otherwise it explains its absence. Root uses a static HTML refresh to `/en/`, with an ordinary link as fallback; no middleware or server redirect is required. Article markup has a language attribute. Canonical and alternate URLs include the configured origin and base path; unpublished translations have no alternate link.

## GitHub Pages setup

1. Push this folder as a repository root. The sample production branch is **main**. If yours differs, change the branch filters in `ci.yml` and `deploy.yml` **and** the deploy job's `refs/heads/main` condition.
2. In Settings → Pages, select **GitHub Actions** as the source. Confirm your repository visibility/plan allows Pages.
3. In Settings → Secrets and variables → Actions → **Variables**, configure the table below. These are public build configuration, not secrets.
4. Push to the production branch or run **Deploy Pages** manually from that branch. Build/validation must succeed before artifact upload; deployment failures remain visible in the separate deploy job and environment.
5. Configure a branch protection rule/ruleset requiring **Deterministic checks**. Merely defining CI does not prevent GitHub from allowing a merge; requiring the check does. Do not require advisory AI review.

| Variable          | Project site                               | Custom domain / account site                              |
| ----------------- | ------------------------------------------ | --------------------------------------------------------- |
| `SITE_URL`        | `https://username.github.io` (origin only) | `https://writing.example.com` or account origin           |
| `PAGES_BASE_PATH` | `/repository` (no trailing slash)          | empty                                                     |
| `CUSTOM_DOMAIN`   | empty                                      | `writing.example.com` for custom domains; otherwise empty |

For custom domains, also set the domain in Settings → Pages, configure DNS according to GitHub's instructions, and enable HTTPS when available. The workflow emits a `CNAME` file when `CUSTOM_DOMAIN` is set. A domain change requires a rebuild, not editing article URLs. Never include the base path in `SITE_URL`. The repository base path is explicit to avoid guessing incorrectly for custom domains or account sites.

The CI workflow builds and checks both an empty base path and `/repository-test`. The deploy workflow repeats required checks using actual production variables. Export verification checks every published route, unpublished route exclusion, canonical/alternate metadata, and local link/asset existence. `.nojekyll` is included.

## Comments with giscus

1. Enable GitHub Discussions on a public repository and install the giscus GitHub App with access to that repository.
2. Create a dedicated **Announcements** category (recommended by giscus so only the integration creates discussion topics).
3. Visit https://giscus.app/, select the repository/category, and obtain its repository ID and category ID.
4. Set Actions variables `GISCUS_REPO` (`owner/repository`), `GISCUS_REPO_ID`, and `GISCUS_CATEGORY_ID`. Rebuild. For local use, set corresponding `NEXT_PUBLIC_GISCUS_*` variables from `.env.example`.

These IDs are public, not credentials. The widget uses **specific** mapping with `article:<stable-slug>` and strict matching. Thus `en/database-index` and `zh/database-index` share `article:database-index`, while `serverless-query` has a different discussion. Never use pathname/URL mapping for translated articles. A discussion may be created when a reader first comments. Readers authenticate through giscus/GitHub; this site stores no accounts or comments. Missing configuration produces a quiet placeholder. Network blockers and GitHub outages can still make the external widget unavailable.

## Advisory AI review

`ai-review.yml` runs on PR creation, updates, reopening and ready-for-review. It is separate from deterministic CI and never edits article files or blocks the build. Setup:

- Add Actions **secret** `AI_API_KEY`.
- Set Actions **variable** `AI_MODEL` to a model supported by your chosen provider.
- Optional `AI_PROVIDER`: `openai-compatible` (default) or `anthropic`.
- Optional `AI_BASE_URL`: HTTPS API prefix such as `https://api.openai.com/v1`, an OpenAI-compatible provider's endpoint, or `https://api.anthropic.com/v1`.
- Permit the workflow's `issues: write` permission for its single PR conversation comment. No personal access token is required.

OpenAI-compatible providers must implement chat completions and JSON response format; Anthropic uses its Messages API adapter. Provider/model availability, account billing and article-sharing approval are the repository owner's responsibility.

The reviewer checks the base/head diff, changed MDX, sibling translations and explicitly imported interactive modules (including a local `.ts` model). Component-only edits directly referenced by an article also trigger review. Import discovery is deliberately bounded, not a whole-program dependency analyzer; indirect dependency changes may need a small related article change to trigger review. Findings contain severity, exact file/line, an explanation and a suggested fix. JSON shape and supplied locations are validated. The reviewer caps total supplied text at about 75,000 characters and each file at 18,000, marks incomplete context, retries transient API failures, and sets request timeouts. Large changes should be split into smaller PRs. AI technical assessments remain fallible.

One bot-authored comment is updated by a stable marker instead of repeatedly posting; the same content is written to the Actions summary. Missing API credentials explicitly report a skipped review. API/configuration/invalid-output failures explicitly report unavailable review and fail the advisory step; job-level `continue-on-error` leaves deterministic CI independent. Logs suppress API bodies and redact the API key from findings. Do not store credentials in content files.

**Trust boundary:** this workflow checks out and executes the trusted **base commit** reviewer, reads PR files using `git show`, and never executes PR MDX or components with an LLM secret. It does not use `pull_request_target`. Fork and Dependabot PRs explicitly skip secret-backed review and still run deterministic checks. Changes to the reviewer itself take effect after merging. Bootstrap this system on the production branch before expecting its first review run. As with any repository secret, only grant write access to trusted collaborators who can change workflows.

## Compatibility and implementation notes

Locked versions: Next.js **16.4.2**, Fumadocs MDX **15.4.7**, Fumadocs Core **16.17.5**, React **19.3.1**, TypeScript **6.0.3**. Node **24** is used locally and in CI. `package-lock.json` locks the full graph; use `npm ci`.

Official [Next.js static-export documentation](https://nextjs.org/docs/app/guides/static-exports) and [Fumadocs static-build documentation](https://www.fumadocs.dev/docs/deploying/static) explicitly support this deployment model. [Fumadocs Next.js integration](https://www.fumadocs.dev/docs/mdx/next) supplies the build plugin. Generated route parameters cover all public pages, and unknown dynamic parameters are disabled. No hosting substitution was made.

The webpack build is explicit. On the tested Windows export, Next's client-router RSC prefetch filenames did not match emitted files on a plain static server. Site navigation therefore uses ordinary anchors, with a shared base-path helper, avoiding any RSC rewrite dependency. This trades client page transitions for predictable Pages behavior; interactive islands still hydrate normally. Fumadocs' dynamic-import cache-analysis warnings can occur during a clean webpack build; they did not prevent compilation or static export.

## Layout

- `content/blog/<id>/{en,zh}.mdx`: content and language-specific metadata.
- `source.config.ts`, `src/lib/schema.ts`: Fumadocs collection and shared schema.
- `src/app/`: statically generated language lists and article pages.
- `src/components/blog/`: navigation and giscus integration.
- `src/components/interactive/`: browser demos and reusable models.
- `scripts/`: content/export validation, tests, AI review.
- `.github/workflows/`: deterministic CI, advisory review, Pages deployment.

See `VERIFICATION.md` for the checks performed and external setup still outstanding.

## Article TL;DR

Place a short, source-faithful summary before the first section:

```mdx
import { TLDR } from "@/components/blog/tldr";

<TLDR>The main result, its tradeoff, and the relevant limitation.</TLDR>
```

Write each translation's summary in its own language. The reusable component supplies a consistent accessible summary box.
