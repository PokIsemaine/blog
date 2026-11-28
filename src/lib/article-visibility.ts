type VisibleArticle = {
  status: "draft" | "published";
};

export function selectVisibleArticles<T extends VisibleArticle>(
  articles: readonly T[],
  nodeEnv: string | undefined,
): T[] {
  const includeDrafts = nodeEnv === "development";
  return articles.filter(
    (article) => article.status === "published" || includeDrafts,
  );
}
