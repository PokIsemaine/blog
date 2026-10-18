import { createMDX } from "fumadocs-mdx/next";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
if (basePath && !/^\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(basePath))
  throw new Error("Invalid base path");
export default createMDX()({
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
});
