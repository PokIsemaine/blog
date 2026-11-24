import { readdir, readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { frontmatter } from "../src/lib/frontmatter";
import { articleSchema } from "../src/lib/schema";
import {
  countTldrUnits,
  extractTldrBlocks,
  TLDR_MAX_UNITS,
} from "../src/lib/tldr-length";
export async function validateContent(root = "content/blog") {
  let count = 0;
  const seen = new Set<string>();
  for (const dir of await readdir(root, { withFileTypes: true })) {
    if (dir.name === ".gitkeep") continue;
    if (!dir.isDirectory()) throw new Error(`Unexpected file: ${dir.name}`);
    for (const file of await readdir(`${root}/${dir.name}`)) {
      if (!file.endsWith(".mdx")) throw new Error(`Unexpected file: ${file}`);
      const path = `${root}/${dir.name}/${file}`;
      const source = await readFile(path, "utf8");
      const parsed = articleSchema.safeParse(frontmatter(source));
      if (!parsed.success) throw new Error(`${path}: ${parsed.error.message}`);
      const a = parsed.data,
        key = `${a.slug}/${a.lang}`;
      if (a.slug !== dir.name || file !== `${a.lang}.mdx`)
        throw new Error(`${path}: slug/lang must match directory/filename`);
      let tldrBlocks: string[];
      try {
        tldrBlocks = extractTldrBlocks(source);
      } catch (error) {
        throw new Error(`${path}: ${(error as Error).message}`);
      }
      for (const block of tldrBlocks) {
        const units = countTldrUnits(block);
        if (units > TLDR_MAX_UNITS)
          throw new Error(
            `${path}: TLDR is ${units} semantic units; maximum is ${TLDR_MAX_UNITS}`,
          );
      }
      if (seen.has(key)) throw new Error(`Duplicate ${key}`);
      seen.add(key);
      count++;
    }
  }
  return count;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  console.log(`Validated ${await validateContent()} article files.`);
}
