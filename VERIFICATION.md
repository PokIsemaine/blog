# Verification — 2026-10-19

## Passed locally (Windows, Node.js 24.14.1)

- Clean `npm ci` using the committed lockfile and npmjs registry.
- `npm run format:check` and `npm run lint` (no remaining warnings).
- `npm run validate`: all four language-specific article files validated.
- `npm run typecheck`: strict TypeScript and generated Next/Fumadocs types.
- `npm test`: three tests covering invalid metadata, every target key of the index demonstration, and the AI reviewer integration with mocked external APIs.
- `npm run build` and `npm run test:export` at the domain root.
- `npm run build` and `npm run test:export` with `/repository-test` as the base path.
- Export checks cover five language/article pages, draft exclusion, internal links, static assets, canonical URLs, and language alternates. The root and 404 pages are also generated.
- Browser checks on the exported site served by Python's plain static HTTP server: SVG image decoding, React slider hydration and state update, English-to-Chinese article navigation, root defaulting to English, missing-translation messaging, and a 390-pixel mobile viewport with no horizontal overflow. No page errors were observed after switching to static document navigation.
- Mocked AI review covers an API rate-limit retry, article/translation/component/model context, exclusion of an unrelated article, API-key redaction, updating an existing bot comment, and rejecting an invalid finding location.
- Missing-key AI review explicitly generates a skipped-review report.
- Production dependency audit: zero reported vulnerabilities after replacing the initial metadata parser with the YAML dependency already used by Fumadocs.

The local Windows MIME registry mapped SVG to `image/svg`; the preview HTTP handler explicitly uses standard `image/svg+xml`. SVG decoding and subpath asset loading passed with the standard MIME type.

## Observed limitations

- Full dependency audit reports five high-severity entries in the development-only `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces` chain (GHSA-vfj7-8cjw-p6xm). The reported automated fix downgrades eslint-config-next to Next 14; that incompatible downgrade was not applied. These dependencies run during linting and are not served in the static site. Track an upstream compatible fix.
- Fumadocs dynamic-import webpack cache-analysis warnings can appear on clean builds. Builds and exports pass.
- Next.js client-router prefetch requests did not match the Windows-emitted RSC filenames on the plain static server. Navigation explicitly uses base-path-aware HTML anchors to eliminate the rewrite dependency; browser checks then passed. This is documented in README.

## Not live-tested / requires owner configuration

No Git remote, target repository, giscus IDs, domain, or LLM credentials were supplied. Consequently these external operations were not performed:

- GitHub Actions execution and actual Pages upload/deployment.
- Live giscus discussion creation, reader sign-in, or cross-language comment posting.
- Calls to a real paid model or live GitHub PR-comment APIs.
- Custom-domain DNS, HTTPS provisioning, and Pages plan/visibility eligibility.

The workflows and configuration are implemented; see README for exact setup steps and required variables/secrets. Require **Deterministic checks** in a branch rule to make failures block merges. AI review remains advisory.
