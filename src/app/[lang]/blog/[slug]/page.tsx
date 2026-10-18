import { ArticleImage } from "@/components/blog/article-image";
import Link from "@/components/blog/site-link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { articles, findArticle } from "@/lib/articles";
import { absolute, articleUrl } from "@/lib/site";
import { Comments } from "@/components/blog/comments";
export const dynamicParams = false;
export function generateStaticParams() {
  return articles.map(({ lang, slug }) => ({ lang, slug }));
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
      <div className="reading">
        <aside aria-label="Table of contents">
          <strong>{lang === "en" ? "On this page" : "本文目录"}</strong>
          {a.toc.map((t) => (
            <a key={t.url} href={t.url}>
              {t.title}
            </a>
          ))}
        </aside>
        <div className="prose">
          <Body components={{ a: Link, img: ArticleImage }} />
          <Comments articleId={slug} lang={lang} />
        </div>
      </div>
    </article>
  );
}
