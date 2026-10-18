/* eslint-disable @next/next/no-img-element -- Static assets need no runtime optimizer. */
import type { ComponentProps } from "react";
import { withBase } from "./site-link";
type StaticImage = { src: string; width?: number; height?: number };
type Props = Omit<ComponentProps<"img">, "src"> & {
  src?: string | StaticImage;
};
export function ArticleImage({
  src,
  alt = "",
  width,
  height,
  ...props
}: Props) {
  const image = typeof src === "object" ? src : undefined;
  const path = typeof src === "string" ? src : image?.src;
  return (
    <img
      {...props}
      alt={alt}
      width={width ?? image?.width}
      height={height ?? image?.height}
      src={path ? withBase(path) : undefined}
      loading="lazy"
    />
  );
}
