import { mdxComponents } from "@/components/blog/mdx";
import { ArticleTOC } from "@/components/blog/article-toc";
import { DocsBody, EditOnGitHub } from "fumadocs-ui/layouts/docs/page";
import Link from "@/components/blog/site-link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { articles, findArticle } from "@/lib/articles";
import { absolute, articleUrl } from "@/lib/site";
import { Comments } from "@/components/blog/comments";
export const dynamicParams = false;
export function generateStaticParams() {
  // Next static export requires a parameter even when the collection is empty.
  // This reserved path renders notFound(), never a placeholder article.
  return articles.length
    ? articles.map(({ lang, slug }) => ({ lang, slug }))
    : [{ lang: "en", slug: "_empty" }];
}
type Props = { params: Promise<{ lang: string; slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const a = findArticle(lang, slug);
  if (!a) notFound();
  const languages = Object.fromEntries(
    articles
      .filter((x) => x.slug === slug)
      .map((x) => [x.lang, absolute(articleUrl(x.lang, slug))]),
  );
  return {
    title: `${a.title} | Systems Notebook`,
    description: a.description,
    alternates: { canonical: absolute(articleUrl(lang, slug)), languages },
  };
}
export default async function Article({ params }: Props) {
  const { lang, slug } = await params;
  const a = findArticle(lang, slug);
  if (!a) notFound();
  const other = lang === "en" ? "zh" : "en";
  const translation = findArticle(other, slug);
  const Body = a.body;
  return (
    <article lang={lang}>
      <Link href={`/${lang}/`}>
        ← {lang === "en" ? "All essays" : "所有文章"}
      </Link>
      <p className="eyebrow">
        {a.tags.join(" / ")} · {a.date}
      </p>
      <h1>{a.title}</h1>
      <p className="lead">{a.description}</p>
      <div className="language">
        {translation ? (
          <Link href={articleUrl(other, slug)}>
            {other === "zh" ? "阅读中文版" : "Read in English"} ↗
          </Link>
        ) : (
          <span>
            {lang === "en"
              ? "Chinese translation is not yet published."
              : "英文翻译尚未发布。"}
          </span>
        )}
      </div>
      <ArticleTOC toc={a.toc} lang={lang}>
        <DocsBody>
          <Body components={mdxComponents} />
          <EditOnGitHub
            href={`https://github.com/PokIsemaine/blog/edit/main/content/blog/${slug}/${lang}.mdx`}
          >
            {lang === "zh" ? "在 GitHub 上编辑" : "Edit on GitHub"}
          </EditOnGitHub>
          <Comments articleId={slug} lang={lang} />
        </DocsBody>
      </ArticleTOC>
    </article>
  );
}
