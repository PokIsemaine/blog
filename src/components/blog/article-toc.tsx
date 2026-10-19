"use client";
import { TOCProvider } from "fumadocs-ui/components/toc";
import { TOCItems, TOCItem } from "fumadocs-ui/components/toc/default";
import { InlineTOC } from "fumadocs-ui/components/inline-toc";
import type { TOCItemType } from "fumadocs-core/toc";
export function ArticleTOC({
  toc,
  lang,
  children,
}: {
  toc: TOCItemType[];
  lang: string;
  children: React.ReactNode;
}) {
  const title = lang === "zh" ? "本文目录" : "On this page";
  return (
    <TOCProvider toc={toc}>
      <div className="mobile-toc">
        <InlineTOC items={toc}>{title}</InlineTOC>
      </div>
      <div className="reading">
        <aside aria-label={title} className="article-toc">
          <strong>{title}</strong>
          <TOCItems>
            {toc.map((item) => (
              <TOCItem key={item.url} item={item} />
            ))}
          </TOCItems>
        </aside>
        {children}
      </div>
    </TOCProvider>
  );
}
