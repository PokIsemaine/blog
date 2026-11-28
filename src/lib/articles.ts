import { blog } from "../../.source/server";
import { selectVisibleArticles } from "./article-visibility";
export const articles = selectVisibleArticles(blog, process.env.NODE_ENV);
export const findArticle = (lang: string, slug: string) =>
  articles.find((a) => a.lang === lang && a.slug === slug);
