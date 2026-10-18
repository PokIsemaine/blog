import { blog } from "../../.source/server";
export const articles = blog.filter((a) => a.status === "published");
export const findArticle = (lang: string, slug: string) =>
  articles.find((a) => a.lang === lang && a.slug === slug);
