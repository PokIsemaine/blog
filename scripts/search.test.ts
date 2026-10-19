import { test } from "node:test";
import assert from "node:assert/strict";
import { createSearchAPI } from "fumadocs-core/search/server";
test("native Fumadocs search returns heading locations and filters bilingual results", async () => {
  const index = createSearchAPI("advanced", {
    localeFilter: true,
    indexes: [
      {
        id: "en/index",
        title: "Indexes",
        locale: "en",
        url: "/blog/en/blog/index/",
        structuredData: {
          headings: [{ id: "heap", content: "Heap lookup" }],
          contents: [
            { heading: "heap", content: "An index may require heap lookups." },
          ],
        },
      },
      {
        id: "zh/index",
        title: "数据库索引",
        locale: "zh",
        url: "/blog/zh/blog/index/",
        structuredData: {
          headings: [{ id: "lookup", content: "查询索引" }],
          contents: [{ heading: "lookup", content: "索引查询可能需要回表。" }],
        },
      },
    ],
  });
  const en = await index.search("heap", { locale: "en" });
  assert.ok(en.length > 0);
  assert.ok(en.every((r) => r.url.startsWith("/blog/en/")));
  assert.ok(en.some((r) => r.url.includes("#heap")));
  const zh = await index.search("索引", { locale: "zh" });
  assert.ok(zh.length > 0);
  assert.ok(zh.every((r) => r.url.startsWith("/blog/zh/")));
  assert.equal(
    (await index.search("no-such-phrase-xyz", { locale: "en" })).length,
    0,
  );
  const data = await index.staticGET();
  assert.equal(data.status, 200);
  assert.ok((await data.text()).length > 0);
});
