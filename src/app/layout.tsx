import { Search } from "@/components/blog/search";
import { articles } from "@/lib/articles";
import { articleUrl } from "@/lib/site";
import "./style.css";
import { basePath } from "@/lib/site";
import Link from "@/components/blog/site-link";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          type="image/svg+xml"
          href={`${basePath}/favicon.svg`}
        />
      </head>
      <body>
        <header>
          <Link href="/en/" className="brand">
            Systems / Notebook
          </Link>
          <span>Notes on how things work.</span>
          <nav>
            <Search
              entries={articles.map((a) => ({
                title: a.title,
                description: a.description,
                lang: a.lang,
                url: articleUrl(a.lang, a.slug),
                text: [
                  ...a.structuredData.headings.map((h) => h.content),
                  ...a.structuredData.contents.map((c) => c.content),
                  ...a.tags,
                ].join(" "),
              }))}
            />
            <Link href="/en/">English</Link>
            <Link href="/zh/">中文</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer>Built with curiosity. Published from Git.</footer>
      </body>
    </html>
  );
}
