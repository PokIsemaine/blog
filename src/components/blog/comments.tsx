"use client";
import Giscus from "@giscus/react";
export function Comments({
  articleId,
  lang,
}: {
  articleId: string;
  lang: string;
}) {
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;
  if (!repo || !repoId || !categoryId)
    return (
      <section className="comments">
        <h2>{lang === "zh" ? "讨论" : "Discussion"}</h2>
        <p>
          {lang === "zh"
            ? "评论尚未启用。"
            : "Comments are not configured yet."}
        </p>
      </section>
    );
  return (
    <section className="comments">
      <h2>{lang === "zh" ? "讨论" : "Discussion"}</h2>
      <Giscus
        key={articleId}
        repo={repo as `${string}/${string}`}
        repoId={repoId}
        categoryId={categoryId}
        mapping="specific"
        term={`article:${articleId}`}
        strict="1"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="light"
        lang={lang === "zh" ? "zh-CN" : "en"}
        loading="lazy"
      />
    </section>
  );
}
