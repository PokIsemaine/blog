"use client";
import { usePathname, useParams } from "next/navigation";
import { RootProvider, useTheme } from "fumadocs-ui/provider/base";
import { FrameworkProvider } from "fumadocs-core/framework";
import { SearchDialogStatic } from "./search";
import SiteLink, { withBase } from "./site-link";
function StaticLink({
  prefetch: _prefetch,
  ...props
}: React.ComponentProps<"a"> & { prefetch?: boolean }) {
  void _prefetch;
  return <SiteLink {...props} />;
}
function useStaticRouter() {
  return {
    push: (url: string) => window.location.assign(withBase(url)),
    refresh: () => window.location.reload(),
  };
}
export function Providers({ children }: { children: React.ReactNode }) {
  const zh = usePathname().split("/").includes("zh");
  return (
    <FrameworkProvider
      Link={StaticLink}
      usePathname={usePathname}
      useParams={useParams}
      useRouter={useStaticRouter}
    >
      <RootProvider
        search={{ SearchDialog: SearchDialogStatic, preload: false }}
        theme={{ defaultTheme: "light" }}
        i18n={{
          locale: zh ? "zh" : "en",
          translations: zh
            ? {
                Search: "搜索",
                "Search documentation": "搜索文章",
                "No results found": "没有找到结果",
                "Type something to search...": "输入关键词搜索……",
                "On this page": "本文目录",
                "Copy Text": "复制代码",
                "Copied Text": "已复制",
                "Copy Anchor Link": "复制章节链接",
                "Close Search": "关闭搜索",
              }
            : undefined,
        }}
      >
        {children}
      </RootProvider>
    </FrameworkProvider>
  );
}
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      className="theme-toggle"
      aria-label="Toggle color theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      ◐
    </button>
  );
}
