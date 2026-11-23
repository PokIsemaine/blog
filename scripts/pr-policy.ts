export const issueLinkRule = "review-rules/pr-issue-link.md";

export type IssueLinkStatus = "present" | "missing" | "unknown";

const issueReferencePatterns = [
  /(?:^|[\s(（\[【,，;；:：=])#([1-9]\d*)\b/m,
  /(?:^|[\s(（\[【,，;；:：=])[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+#([1-9]\d*)\b/m,
  /https?:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/issues\/([1-9]\d*)\b/i,
];

function stripNonProse(body: string): string {
  return body
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(
      /^[ \t]*(?:`{3,}|~{3,})[^\n]*\n[\s\S]*?^[ \t]*(?:`{3,}|~{3,})[ \t]*$/gm,
      "",
    )
    .replace(/`[^`\n]*`/g, "");
}

export function hasLinkedIssue(body: string): boolean {
  const prose = stripNonProse(body);
  return issueReferencePatterns.some((pattern) => pattern.test(prose));
}

export function issueLinkStatus(body: string | undefined): IssueLinkStatus {
  if (body === undefined) return "unknown";
  return hasLinkedIssue(body) ? "present" : "missing";
}

export function issueLinkSuggestion(): string {
  return `${issueLinkRule}：PR 描述未关联 issue；请在 PR 描述中添加 Closes #123、Fixes #123、Refs #123 或完整 issue 链接，并确认编号指向驱动本次改动的 issue。`;
}
