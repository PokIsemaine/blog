"use client";
import { usePathname } from "next/navigation";
import { useStaticSearch } from "fumadocs-core/search/client";
import {
  useSearchContext,
  type SharedProps,
} from "fumadocs-ui/contexts/search";
import {
  SearchDialog,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  SearchDialogClose,
} from "fumadocs-ui/components/dialog/search";
import { basePath } from "@/lib/site";
export function SearchDialogStatic(props: SharedProps) {
  const lang = usePathname().split("/").includes("zh") ? "zh" : "en";
  const search = useStaticSearch({
    from: `${basePath}/search-index.json`,
    locale: lang,
  });
  return (
    <SearchDialog
      {...props}
      {...search}
      onSelect={(item) => {
        if ("url" in item) window.location.assign(item.url);
      }}
    >
      <SearchDialogOverlay />
      <SearchDialogContent
        aria-label={lang === "zh" ? "搜索文章" : "Search articles"}
      >
        <SearchDialogHeader>
          <SearchDialogInput
            placeholder={lang === "zh" ? "搜索文章……" : "Search articles…"}
            aria-label={lang === "zh" ? "搜索文章" : "Search articles"}
          />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList />
      </SearchDialogContent>
    </SearchDialog>
  );
}
export function Search() {
  const { setOpenSearch } = useSearchContext();
  const zh = usePathname().split("/").includes("zh");
  return (
    <button
      className="search-trigger"
      aria-haspopup="dialog"
      onClick={() => setOpenSearch(true)}
    >
      {zh ? "搜索" : "Search"} <kbd>⌘/Ctrl K</kbd>
    </button>
  );
}
