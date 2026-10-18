import Link from "@/components/blog/site-link";
import { notFound } from "next/navigation";
import { articles } from "@/lib/articles";
import { absolute, articleUrl } from "@/lib/site";
export const dynamicParams = false;
export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "zh" }];
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return {
    title: "Systems Notebook",
    alternates: {
      canonical: absolute(`/${lang}/`),
      languages: { en: absolute("/en/"), zh: absolute("/zh/") },
    },
  };
}
export default async function Index({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!["en", "zh"].includes(lang)) notFound();
  return (
    <section lang={lang}>
      <p className="eyebrow">FIELD NOTES · DATABASES & INFRASTRUCTURE</p>
      <h1>
        {lang === "en" ? "Understand the machinery." : "理解系统背后的机制。"}
      </h1>
      <p className="lead">
        {lang === "en"
          ? "Technical essays, small experiments, and ideas you can take apart."
          : "技术文章、交互实验，以及可以拆解的想法。"}
      </p>
      <div className="articles">
        {articles
          .filter((a) => a.lang === lang)
          .map((a) => (
            <Link className="card" href={articleUrl(lang, a.slug)} key={a.slug}>
              <small>
                {a.tags.join(" / ")} · {a.date}
              </small>
              <h2>{a.title} ↗</h2>
              <p>{a.description}</p>
            </Link>
          ))}
      </div>
      <p>
        {lang === "zh" ? "部分文章尚未翻译。" : "Looking for another language?"}{" "}
        <Link href={lang === "en" ? "/zh/" : "/en/"}>
          {lang === "zh" ? "浏览英文文章 →" : "浏览中文文章 →"}
        </Link>
      </p>
    </section>
  );
}
