export const TLDR_MAX_UNITS = 120;

const CJK_CHARACTER =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu;
const WORD = /[\p{L}\p{N}]+(?:['’.-][\p{L}\p{N}]+)*/gu;

function visibleText(markdown: string) {
  return markdown
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s*(?:[-+*]|\d+[.)])\s+/gm, " ")
    .replace(/[`*_~]/g, " ");
}

export function countTldrUnits(markdown: string) {
  const text = visibleText(markdown);
  const cjkCount = text.match(CJK_CHARACTER)?.length ?? 0;
  const wordCount = text.replace(CJK_CHARACTER, " ").match(WORD)?.length ?? 0;
  return cjkCount + wordCount;
}

export function extractTldrBlocks(source: string) {
  const blockPattern = /<TLDR(?:\s[^>]*)?>([\s\S]*?)<\/TLDR>/g;
  const blocks = [...source.matchAll(blockPattern)].map((match) => match[1]);
  const openings = source.match(/<TLDR(?:\s[^>]*)?>/g)?.length ?? 0;
  const closings = source.match(/<\/TLDR>/g)?.length ?? 0;
  if (openings !== closings || openings !== blocks.length)
    throw new Error("TLDR block must have matching opening and closing tags");
  return blocks;
}
