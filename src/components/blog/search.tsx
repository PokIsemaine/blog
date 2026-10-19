"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "./site-link";
import { searchArticles, type SearchEntry } from "@/lib/search";
export function Search({ entries }: { entries: SearchEntry[] }) {
  const dialog = useRef<HTMLDialogElement>(null),
    input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const zh = pathname.split("/").includes("zh"),
    lang = zh ? "zh" : "en";
  const results = searchArticles(entries, query, lang);
  function open() {
    setQuery("");
    dialog.current?.showModal();
    input.current?.focus();
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        dialog.current?.showModal();
        input.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return (
    <>
      <button className="search-trigger" onClick={open} aria-haspopup="dialog">
        {zh ? "搜索" : "Search"} <kbd>⌘/Ctrl K</kbd>
      </button>
      <dialog
        ref={dialog}
        className="search-dialog"
        aria-labelledby="search-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <div className="search-heading">
          <h2 id="search-title">{zh ? "搜索文章" : "Search articles"}</h2>
          <button
            onClick={() => dialog.current?.close()}
            aria-label={zh ? "关闭搜索" : "Close search"}
          >
            ✕
          </button>
        </div>
        <label htmlFor="article-search" className="search-label">
          {zh
            ? "标题、描述或正文关键词"
            : "Keywords in titles, descriptions, or article text"}
        </label>
        <input
          ref={input}
          id="article-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={zh ? "例如：索引、查询" : "Try: index, startup, latency"}
          autoComplete="off"
        />
        <p className="search-status" role="status">
          {query.trim()
            ? zh
              ? `找到 ${results.length} 篇文章`
              : `${results.length} articles found`
            : zh
              ? "输入关键词开始搜索。"
              : "Type to search published articles."}
        </p>
        <ul className="search-results">
          {results.map((entry) => (
            <li key={entry.url}>
              <Link href={entry.url}>
                <strong>{entry.title}</strong>
                <p>{entry.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </dialog>
    </>
  );
}
