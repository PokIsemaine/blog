import { readdir, readFile } from "node:fs/promises";
import { frontmatter } from "../src/lib/frontmatter";
import { articleSchema } from "../src/lib/schema";
export async function validateContent(root = "content/blog") {
  let count = 0;
  const seen = new Set<string>();
  for (const dir of await readdir(root, { withFileTypes: true })) {
    if (!dir.isDirectory()) throw new Error(`Unexpected file: ${dir.name}`);
    for (const file of await readdir(`${root}/${dir.name}`)) {
      if (!file.endsWith(".mdx")) throw new Error(`Unexpected file: ${file}`);
      const path = `${root}/${dir.name}/${file}`;
      const parsed = articleSchema.safeParse(
        frontmatter(await readFile(path, "utf8")),
      );
      if (!parsed.success) throw new Error(`${path}: ${parsed.error.message}`);
      const a = parsed.data,
        key = `${a.slug}/${a.lang}`;
      if (a.slug !== dir.name || file !== `${a.lang}.mdx`)
        throw new Error(`${path}: slug/lang must match directory/filename`);
      if (seen.has(key)) throw new Error(`Duplicate ${key}`);
      seen.add(key);
      count++;
    }
  }
  return count;
}
console.log(`Validated ${await validateContent()} article files.`);
