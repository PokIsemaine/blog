import { defineCollections, defineConfig } from "fumadocs-mdx/config";
import { articleSchema } from "./src/lib/schema";
export const blog = defineCollections({
  type: "doc",
  dir: "content/blog",
  schema: articleSchema,
});
export default defineConfig();
