import type { ComponentProps } from "react";
import { basePath } from "@/lib/site";
export function withBase(href: string) {
  return href.startsWith("/") &&
    !href.startsWith("//") &&
    !(basePath && (href === basePath || href.startsWith(basePath + "/")))
    ? `${basePath}${href}`
    : href;
}
// Full document navigation works on plain static hosts without RSC URL rewrites.
export default function SiteLink({ href, ...props }: ComponentProps<"a">) {
  return <a {...props} href={href ? withBase(href) : undefined} />;
}
