import { test } from "node:test";
import assert from "node:assert/strict";
import { articleSchema } from "../src/lib/schema";
const valid = {
  title: "Title",
  description: "Summary",
  slug: "a-post",
  lang: "en",
  status: "published",
  date: "2026-10-19",
};
test("rejects ambiguous identifiers, unsupported locales, missing status and impossible dates", () => {
  assert.ok(articleSchema.safeParse(valid).success);
  for (const change of [
    { slug: "../escape" },
    { lang: "fr" },
    { status: undefined },
    { date: "2026-02-30" },
    { title: "" },
  ])
    assert.equal(
      articleSchema.safeParse({ ...valid, ...change }).success,
      false,
    );
});
