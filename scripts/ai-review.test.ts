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
  calls++;if(calls===1)return new Response('',{status:429,headers:{'retry-after':'0.001'}});
  if(process.env.AI_PROVIDER==='deepseek' && url!=='https://api.deepseek.com/chat/completions')throw Error('Wrong DeepSeek endpoint');
  writeFileSync('context.json',init.body);
  return Response.json({choices:[{message:{content:JSON.stringify(process.env.INVALID_RESPONSE ? {结论:'approve',建议:'invalid'} : {结论:'reject',建议:[(process.env.INVALID_RULE==='missing' ? 'review-rules/missing.md' : 'review-rules/correctness.md')+'：'+(process.env.INVALID_RULE==='empty'?'':'content/blog/post/en.mdx:1 Leak '+process.env.AI_API_KEY+' Clarify the claim.')]})}}]});
 }
 if(init.method==='PATCH'){writeFileSync('posted.json',init.body);return Response.json({});}
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
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
