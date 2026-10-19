import { test } from "node:test";
import assert from "node:assert/strict";
import { searchArticles } from "../src/lib/search";
const entries = [
  {
    title: "Index lookup",
    description: "Sorted keys",
    lang: "en",
    url: "/en/blog/index/",
    text: "Storage and write overhead",
  },
  {
    title: "Storage",
    description: "Other",
    lang: "en",
    url: "/en/blog/storage/",
    text: "index",
  },
  {
    title: "索引",
    description: "查找",
    lang: "zh",
    url: "/zh/blog/index/",
    text: "存储开销",
  },
];
test("search ranks title matches, searches body, isolates language and handles empty/multiple terms", () => {
  assert.equal(searchArticles(entries, "INDEX", "en")[0].title, "Index lookup");
  assert.equal(searchArticles(entries, "write overhead", "en").length, 1);
  assert.equal(searchArticles(entries, "索引", "zh").length, 1);
  assert.equal(searchArticles(entries, "索引", "en").length, 0);
  assert.equal(searchArticles(entries, "   ", "en").length, 0);
  assert.equal(searchArticles(entries, "missing", "en").length, 0);
});
