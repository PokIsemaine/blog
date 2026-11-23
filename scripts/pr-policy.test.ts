import { test } from "node:test";
import assert from "node:assert/strict";
import {
  hasLinkedIssue,
  issueLinkStatus,
  issueLinkSuggestion,
} from "./pr-policy";

test("PR issue links accept common GitHub reference forms", () => {
  const linked = [
    "Closes #3",
    "Fixes #12.",
    "Refs: #7",
    "关联 issue：#9",
    "owner/repo#42",
    "https://github.com/PokIsemaine/blog/issues/3",
    "See [#4](https://github.com/PokIsemaine/blog/issues/4).",
  ];
  for (const body of linked)
    assert.equal(hasLinkedIssue(body), true, `Expected link in: ${body}`);
});

test("PR issue links reject empty descriptions and non-prose references", () => {
  const unlinked = [
    "",
    "No issue here.",
    "```\nCloses #3\n```",
    "`Closes #3`",
    "<!-- Closes #3 -->",
    "Fixes #0",
  ];
  for (const body of unlinked)
    assert.equal(hasLinkedIssue(body), false, `Unexpected link in: ${body}`);
});

test("PR issue link status distinguishes an unavailable description", () => {
  assert.equal(issueLinkStatus(undefined), "unknown");
  assert.equal(issueLinkStatus(""), "missing");
  assert.equal(issueLinkStatus("Closes #3"), "present");
});

test("PR issue link suggestion points at its review rule", () => {
  assert.ok(
    issueLinkSuggestion().startsWith("review-rules/pr-issue-link.md："),
  );
});
