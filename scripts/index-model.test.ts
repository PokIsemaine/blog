import { test } from "node:test";
import assert from "node:assert/strict";
import { lookup } from "../src/components/interactive/index-model";
test("demo finds every key and satisfies its documented comparison bound", () => {
  for (let target = 1; target <= 1024; target++) {
    const scan = lookup(1024, target, false),
      binary = lookup(1024, target, true);
    assert.equal(scan.found, target);
    assert.equal(scan.comparisons, target);
    assert.equal(binary.found, target);
    assert.ok(binary.comparisons <= 11);
  }
});
