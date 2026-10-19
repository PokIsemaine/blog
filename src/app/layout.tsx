import { Providers, ThemeToggle } from "@/components/blog/providers";
import "fumadocs-ui/style.css";
import { Search } from "@/components/blog/search";
import "./style.css";
import { basePath } from "@/lib/site";
import Link from "@/components/blog/site-link";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          type="image/svg+xml"
          href={`${basePath}/favicon.svg`}
        />
      </head>
      <body>
        <Providers>
          <header className="site-header">
            <Link href="/en/" className="brand">
              Systems / Notebook
            </Link>
            <span>Notes on how things work.</span>
            <nav>
              <Search />
              <ThemeToggle />
              <Link href="/en/">English</Link>
              <Link href="/zh/">中文</Link>
            </nav>
          </header>
          <main className="site-main">{children}</main>
          <footer className="site-footer">
            Built with curiosity. Published from Git.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
