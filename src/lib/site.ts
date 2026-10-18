export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const siteOrigin =
  process.env.NEXT_PUBLIC_SITE_URL || "https://example.github.io";
export const absolute = (path: string) =>
  `${siteOrigin.replace(/\/$/, "")}${basePath}${path}`;
export const articleUrl = (lang: string, slug: string) =>
  `/${lang}/blog/${slug}/`;
