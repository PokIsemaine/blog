import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const runner = resolve("scripts/ai-review.ts");
const tsx = pathToFileURL(require.resolve("tsx")).href;
for (const apiKey of ["fake-test-key", ""]) {
  test(`AI review skips rules/config/docs-only changes without external requests (${apiKey ? "with" : "without"} API key)`, async () => {
    const dir = await mkdtemp(join(tmpdir(), "writing-review-skip-"));
    try {
      const git = (...args: string[]) =>
        execFileSync("git", args, { cwd: dir, encoding: "utf8" }).trim();
      git("init", "--quiet");
      git("config", "user.name", "Test");
      git("config", "user.email", "test@example.com");
      await mkdir(join(dir, "content/blog/post"), { recursive: true });
      await writeFile(
        join(dir, "content/blog/post/en.mdx"),
        "Unchanged article.",
      );
      git("add", ".");
      git("commit", "--quiet", "-m", "base");
      const base = git("rev-parse", "HEAD");
      await mkdir(join(dir, "review-rules"));
      await mkdir(join(dir, ".github"));
      await writeFile(
        join(dir, "review-rules/correctness.md"),
        "Check evidence.",
      );
      await writeFile(join(dir, ".github/ai-review.json"), "{}");
      await writeFile(join(dir, "README.md"), "Updated review documentation.");
      git("add", ".");
      git("commit", "--quiet", "-m", "rules and documentation");
      const head = git("rev-parse", "HEAD");
      const mock = join(dir, "mock.mjs");
      await writeFile(
        mock,
        `import { appendFileSync } from 'node:fs';
globalThis.fetch = async (url) => {
  appendFileSync('requests.log', String(url) + '\\n');
  throw new Error('External requests must not occur for skipped reviews');
};`,
      );
      await writeFile(join(dir, "requests.log"), "");
      const result = spawnSync(
        process.execPath,
        ["--import", tsx, "--import", pathToFileURL(mock).href, runner],
        {
          cwd: dir,
          env: {
            ...process.env,
            AI_API_KEY: apiKey,
            GITHUB_TOKEN: "fake-github",
            GITHUB_REPOSITORY: "owner/repo",
            PR_NUMBER: "11",
            PR_BODY: "Rules, configuration and documentation only.",
            BASE_SHA: base,
            HEAD_SHA: head,
            GITHUB_STEP_SUMMARY: join(dir, "summary.md"),
          },
          encoding: "utf8",
          timeout: 30000,
        },
      );
      assert.equal(result.status, 0, result.stderr);
      assert.equal(await readFile(join(dir, "requests.log"), "utf8"), "");
      assert.match(
        await readFile(join(dir, "summary.md"), "utf8"),
        /No changed articles or directly dependent articles to review\./,
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
}
test("AI review uses scoped context, retries transient errors, redacts keys and updates its own comment", async () => {
  const dir = await mkdtemp(join(tmpdir(), "writing-review-"));
  try {
    const git = (...args: string[]) =>
      execFileSync("git", args, { cwd: dir, encoding: "utf8" }).trim();
    git("init", "--quiet");
    git("config", "user.name", "Test");
    git("config", "user.email", "test@example.com");
    await mkdir(join(dir, "content/blog/post"), { recursive: true });
    await mkdir(join(dir, "src/components/interactive"), { recursive: true });
    await writeFile(join(dir, "content/blog/post/en.mdx"), "Original");
    await mkdir(join(dir, "content/blog/unrelated"));
    await writeFile(
      join(dir, "content/blog/unrelated/en.mdx"),
      "UNRELATED_SENTINEL",
    );
    git("add", ".");
    git("commit", "--quiet", "-m", "base");
    const base = git("rev-parse", "HEAD");
    await writeFile(
      join(dir, "content/blog/post/en.mdx"),
      'import { Demo } from "@/components/interactive/demo";\n\nA claim.',
    );
    await writeFile(join(dir, "content/blog/post/zh.mdx"), "翻译");
    await writeFile(
      join(dir, "src/components/interactive/demo.tsx"),
      'import { model } from "./model";\nexport const Demo=()=>model;',
    );
    await writeFile(
      join(dir, "src/components/interactive/model.ts"),
      "export const model=42;",
    );
    git("add", ".");
    git("commit", "--quiet", "-m", "article");
    const head = git("rev-parse", "HEAD");
    await mkdir(join(dir, ".github/review-skills"), { recursive: true });
    await writeFile(
      join(dir, ".github/ai-review.json"),
      JSON.stringify({
        prompt: "CUSTOM_PROMPT",
        skills: [".github/review-skills/test.md"],
      }),
    );
    await writeFile(join(dir, ".github/review-skills/test.md"), "CUSTOM_SKILL");
    await mkdir(join(dir, "review-rules"));
    await writeFile(
      join(dir, "review-rules/correctness.md"),
      "RULE_SENTINEL: Check evidence.",
    );
    const mock = join(dir, "mock.mjs");
    await writeFile(
      mock,
      `import {writeFileSync} from 'node:fs';
let calls=0;
globalThis.fetch=async (url,init)=>{
 if(url.includes('/chat/completions')){
  if(process.env.GITHUB_FAILURE==='model')return new Response('secret model body',{status:401});
  calls++;if(calls===1)return new Response('',{status:429,headers:{'retry-after':'0.001'}});
  if(process.env.AI_PROVIDER==='deepseek' && url!=='https://api.deepseek.com/chat/completions')throw Error('Wrong DeepSeek endpoint');
  writeFileSync('context.json',init.body);
  return Response.json({choices:[{message:{content:JSON.stringify(process.env.INVALID_RESPONSE ? {结论:'approve',建议:'invalid'} : {结论:'reject',建议:[(process.env.INVALID_RULE==='missing' ? 'review-rules/missing.md' : 'review-rules/correctness.md')+'：'+(process.env.INVALID_RULE==='empty'?'':'content/blog/post/en.mdx:1 Leak '+process.env.AI_API_KEY+' Clarify the claim.')]})}}]});
 }
 if(process.env.GITHUB_FAILURE==='network')throw Error(process.env.GITHUB_TOKEN+' '+process.env.AI_API_KEY+' private article');
 if(process.env.GITHUB_FAILURE==='query')return new Response('github secret response body',{status:503,headers:{'x-github-request-id':'query-request-123','retry-after':'0.001'}});
 if(process.env.GITHUB_FAILURE==='malformed')return new Response('private article',{status:200});
 if(init.method==='PATCH' || init.method==='POST'){
  if(['publish','create'].includes(process.env.GITHUB_FAILURE))return new Response('github publish response body',{status:403,headers:{'x-github-request-id':'publish-request-456'}});
  writeFileSync('posted.json',init.body);return Response.json({});
 }
 if(process.env.GITHUB_FAILURE==='create')return Response.json([]);
 return Response.json([{id:42,user:{login:'github-actions[bot]'},body:'<!-- systems-notebook-ai-review --> old'}]);
};`,
    );
    const env = {
      ...process.env,
      AI_API_KEY: "fake-test-key",
      AI_MODEL: "mock-model",
      AI_PROVIDER: "openai-compatible",
      AI_BASE_URL: "https://mock.invalid/v1",
      GITHUB_TOKEN: "fake-github",
      GITHUB_REPOSITORY: "owner/repo",
      PR_NUMBER: "1",
      PR_BODY: "Closes #3",
      BASE_SHA: base,
      HEAD_SHA: head,
      GITHUB_STEP_SUMMARY: join(dir, "summary.md"),
    };
    let result = spawnSync(
      process.execPath,
      ["--import", tsx, "--import", pathToFileURL(mock).href, runner],
      { cwd: dir, env, encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stderr);
    const context = await readFile(join(dir, "context.json"), "utf8");
    assert.ok(context.includes("local interactive model"));
    assert.ok(context.includes("翻译"));
    assert.ok(context.includes("CUSTOM_PROMPT"));
    assert.ok(context.includes("CUSTOM_SKILL"));
    assert.ok(context.includes("RULE_SENTINEL"));
    assert.ok(!context.includes("UNRELATED_SENTINEL"));
    const posted = await readFile(join(dir, "posted.json"), "utf8");
    assert.ok(posted.includes("[REDACTED]"));
    assert.ok(!posted.includes("fake-test-key"));
    const comment = JSON.parse(posted).body;
    const review = JSON.parse(comment.split("```json\n")[1].split("\n```")[0]);
    assert.equal(review.结论, "reject");
    assert.equal(review.建议.length, 1);
    await rm(join(dir, "context.json"), { force: true });
    result = spawnSync(
      process.execPath,
      ["--import", tsx, "--import", pathToFileURL(mock).href, runner],
      {
        cwd: dir,
        env: { ...env, PR_BODY: "No issue link." },
        encoding: "utf8",
      },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(
      await readFile(join(dir, "context.json"), "utf8").catch(() => null),
      null,
      "Issue-link rejection must not call the AI",
    );
    const issueComment = JSON.parse(
      await readFile(join(dir, "posted.json"), "utf8"),
    ).body;
    assert.ok(issueComment.includes("review-rules/pr-issue-link.md"));
    assert.ok(issueComment.includes('"结论": "reject"'));
    result = spawnSync(
      process.execPath,
      ["--import", tsx, "--import", pathToFileURL(mock).href, runner],
      {
        cwd: dir,
        env: { ...env, AI_PROVIDER: "deepseek", AI_BASE_URL: "" },
        encoding: "utf8",
      },
    );
    assert.equal(result.status, 0, result.stderr);
    result = spawnSync(
      process.execPath,
      ["--import", tsx, "--import", pathToFileURL(mock).href, runner],
      { cwd: dir, env: { ...env, INVALID_RESPONSE: "1" }, encoding: "utf8" },
    );
    assert.equal(result.status, 1);
    assert.ok(
      (await readFile(join(dir, "ai-review.md"), "utf8")).includes(
        "unavailable",
      ),
    );
    assert.match(result.stderr, /response validation/);
    for (const invalid of ["missing", "empty"]) {
      result = spawnSync(
        process.execPath,
        ["--import", tsx, "--import", pathToFileURL(mock).href, runner],
        { cwd: dir, env: { ...env, INVALID_RULE: invalid }, encoding: "utf8" },
      );
      assert.equal(
        result.status,
        1,
        "Reject unknown or empty rule suggestions",
      );
    }
    await writeFile(
      join(dir, ".github/ai-review.json"),
      JSON.stringify({ skills: ["../outside.md"] }),
    );
    result = spawnSync(
      process.execPath,
      ["--import", tsx, "--import", pathToFileURL(mock).href, runner],
      { cwd: dir, env, encoding: "utf8" },
    );
    assert.equal(
      result.status,
      1,
      "Reject skills outside the trusted checkout",
    );
    await writeFile(join(dir, ".github/ai-review.json"), "{}");
    for (const failure of [
      "query",
      "publish",
      "create",
      "network",
      "model",
      "malformed",
    ] as const) {
      await writeFile(join(dir, "summary.md"), "");
      result = spawnSync(
        process.execPath,
        ["--import", tsx, "--import", pathToFileURL(mock).href, runner],
        {
          cwd: dir,
          env: {
            ...env,
            GITHUB_FAILURE: failure,
            AI_API_KEY: "github-secret-key",
          },
          encoding: "utf8",
        },
      );
      assert.equal(result.status, 1, `Report GitHub ${failure} failure`);
      const operation = {
        query: "GitHub query comments",
        publish: "GitHub update comment",
        create: "GitHub create comment",
        network: "GitHub query comments",
        model: "model request",
        malformed: "GitHub query comments response validation",
      }[failure];
      assert.match(result.stderr, new RegExp(`stage=${operation}`));
      if (failure === "network")
        assert.match(result.stderr, /category=network_error/);
      else
        assert.match(
          result.stderr,
          new RegExp(
            `status=${{ query: 503, publish: 403, create: 403, model: 401, malformed: 200 }[failure]}`,
          ),
        );
      if (["query", "publish", "create"].includes(failure))
        assert.match(
          result.stderr,
          /request_id=(query-request-123|publish-request-456)/,
        );
      assert.doesNotMatch(
        result.stdout + result.stderr,
        /github-secret-key|fake-github|github secret response body|github publish response body|secret model body|private article|Clarify the claim/,
      );
      const summary = await readFile(join(dir, "summary.md"), "utf8");
      if (failure !== "model") {
        assert.match(summary, /Advisory AI review/);
        assert.match(summary, /comment publication failed/);
        assert.doesNotMatch(summary, /AI review unavailable/);
        assert.match(
          await readFile(join(dir, "ai-review.md"), "utf8"),
          /Clarify the claim/,
        );
      }
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
