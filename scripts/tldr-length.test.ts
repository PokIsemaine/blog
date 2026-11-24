import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { countTldrUnits, TLDR_MAX_UNITS } from "../src/lib/tldr-length";
import { validateContent } from "./validate-content";

test("counts English words and CJK characters as semantic units", () => {
  assert.equal(
    countTldrUnits(
      Array.from({ length: TLDR_MAX_UNITS }, () => "word").join(" "),
    ),
    TLDR_MAX_UNITS,
  );
  assert.equal(countTldrUnits("字".repeat(TLDR_MAX_UNITS)), TLDR_MAX_UNITS);
  assert.equal(countTldrUnits("中文 and English"), 4);
  assert.equal(countTldrUnits("**Short** [summary](https://example.com)."), 2);
});

test("validateContent accepts the limit and rejects longer TLDRs", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "tldr-length-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const dir = join(root, "length-test");
  await mkdir(dir);
  const article = (body: string) => `---
title: Length Test
description: Test the TLDR limit.
slug: length-test
lang: en
status: draft
date: 2026-11-25
---

${body}
`;
  const path = join(dir, "en.mdx");
  await writeFile(
    path,
    article(
      `<TLDR>\n${Array.from({ length: TLDR_MAX_UNITS }, () => "word").join(" ")}\n</TLDR>`,
    ),
  );
  assert.equal(await validateContent(root), 1);

  await writeFile(
    path,
    article(
      `<TLDR>\n${Array.from({ length: TLDR_MAX_UNITS + 1 }, () => "word").join(" ")}\n</TLDR>`,
    ),
  );
  await assert.rejects(
    () => validateContent(root),
    /length-test\/en\.mdx: TLDR is 121 semantic units; maximum is 120/,
  );
});
