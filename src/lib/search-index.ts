import { createSearchAPI } from "fumadocs-core/search/server";
import { articles } from "./articles";
import { articleUrl, basePath } from "./site";
export const searchIndex = createSearchAPI("advanced", {
  localeFilter: true,
  indexes: articles.map((a) => ({
    id: `${a.lang}/${a.slug}`,
    title: a.title,
    description: a.description,
    locale: a.lang,
    url: `${basePath}${articleUrl(a.lang, a.slug)}`,
    structuredData: a.structuredData,
    tag: a.tags,
  })),
});
