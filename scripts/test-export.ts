import { readFile, readdir, access } from "node:fs/promises";
import assert from "node:assert/strict";
import { frontmatter } from "../src/lib/frontmatter";
import { articleSchema } from "../src/lib/schema";
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
const origin = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://example.github.io"
).replace(/\/$/, "");
const read = (p: string) => readFile(`out/${p}`, "utf8");
const pages = [];
for (const dir of await readdir("content/blog"))
  for (const file of await readdir(`content/blog/${dir}`)) {
    const a = articleSchema.parse(
      frontmatter(await readFile(`content/blog/${dir}/${file}`, "utf8")),
    );
    pages.push(a);
  }
assert.ok((await read("index.html")).includes(`${base}/en/`));
const routes = ["en/index.html", "zh/index.html"];
for (const a of pages) {
  const route = `${a.lang}/blog/${a.slug}/index.html`;
  if (a.status === "draft") {
    await assert.rejects(access(`out/${route}`));
    continue;
  }
  routes.push(route);
  const html = await read(route);
  assert.ok(
    !html.includes('src="[object Object]"'),
    `${route}: invalid image source`,
  );
  assert.ok(
    html.includes(`href="${origin}${base}/${a.lang}/blog/${a.slug}/"`),
    `${route}: canonical URL`,
  );
  for (const translation of pages.filter(
    (t) => t.slug === a.slug && t.status === "published",
  )) {
    assert.ok(
      new RegExp(`hreflang="${translation.lang}"`, "i").test(html),
      `${route}: language alternate`,
    );
    assert.ok(html.includes(`${base}/${translation.lang}/blog/${a.slug}/`));
  }
}
for (const route of routes) {
  const html = await read(route);
  assert.ok(
    !html.includes('src="[object Object]"'),
    `${route}: invalid image source`,
  );
  assert.ok(
    html.includes(`${base}/_next/static/`),
    `${route}: assets missing base path`,
  );
  for (const match of html.matchAll(/(?:href|src)="(\/[^"?#]*)/g)) {
    const url = match[1];
    if (url.startsWith("//")) continue;
    assert.ok(
      !base || url.startsWith(base + "/"),
      `${route}: URL outside base path ${url}`,
    );
    const relative = decodeURIComponent(url.slice(base.length));
    await access(
      "out" + relative + (relative.endsWith("/") ? "index.html" : ""),
    );
  }
}
console.log(
  `Verified ${routes.length} static pages, draft exclusion, links, assets and metadata at '${base || "/"}'.`,
);
