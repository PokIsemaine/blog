export type SearchEntry = {
  title: string;
  description: string;
  lang: string;
  url: string;
  text: string;
};
export function searchArticles(
  entries: SearchEntry[],
  query: string,
  lang: string,
) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return entries
    .filter((e) => e.lang === lang)
    .map((entry) => {
      const title = entry.title.toLocaleLowerCase(),
        description = entry.description.toLocaleLowerCase(),
        text = entry.text.toLocaleLowerCase();
      if (
        !terms.every(
          (t) =>
            title.includes(t) || description.includes(t) || text.includes(t),
        )
      )
        return { entry, score: 0 };
      return {
        entry,
        score: terms.reduce(
          (score, t) =>
            score +
            (title.includes(t) ? 10 : 0) +
            (description.includes(t) ? 4 : 0) +
            (text.includes(t) ? 1 : 0),
          0,
        ),
      };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((x) => x.entry);
}
