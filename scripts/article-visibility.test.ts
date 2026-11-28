import { test } from "node:test";
import assert from "node:assert/strict";
import { selectVisibleArticles } from "../src/lib/article-visibility";

const articles = [
  { slug: "published", status: "published" },
  { slug: "draft", status: "draft" },
] as const;

test("draft previews are visible only in development", () => {
  assert.deepEqual(
    selectVisibleArticles(articles, "production").map((a) => a.slug),
    ["published"],
  );
  assert.deepEqual(
    selectVisibleArticles(articles, "development").map((a) => a.slug),
    ["published", "draft"],
  );
  assert.deepEqual(
    selectVisibleArticles(articles, undefined).map((a) => a.slug),
    ["published"],
  );
});
