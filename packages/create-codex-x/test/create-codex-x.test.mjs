import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { applyBootstrap } from "../src/bootstrap.mjs";
import { normalizeAnswers } from "../src/questions.mjs";
import { copyTemplate, replaceProjectName } from "../src/render-template.mjs";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../..");
const templateDir = path.join(repoRoot, "packages", "workspace-template");

test("copies template and rewrites project name", () => {
  const tempRoot = mkdtempSync(path.join(tmpdir(), "codex-x-copy-"));
  const targetDir = path.join(tempRoot, "workspace");
  copyTemplate(templateDir, targetDir);
  replaceProjectName(targetDir);
  const claude = readFileSync(path.join(targetDir, "CLAUDE.md"), "utf8");
  assert.match(claude, /codex-x/);
  assert.doesNotMatch(claude, /codex-assistant/);
});

test("bootstrap writes user files, first memory, and archives BOOTSTRAP", () => {
  const tempRoot = mkdtempSync(path.join(tmpdir(), "codex-x-bootstrap-"));
  const targetDir = path.join(tempRoot, "workspace");
  copyTemplate(templateDir, targetDir);
  const answers = normalizeAnswers({
    ownerName: "Alex",
    assistantName: "Xiao X",
    language: "中文",
    confirmationBoundaries: ["远端写入", "公开发布"]
  });
  applyBootstrap(targetDir, answers, new Date("2026-05-28T08:00:00Z"));

  const user = readFileSync(path.join(targetDir, "0-System/about-me/USER.md"), "utf8");
  const identity = readFileSync(path.join(targetDir, "0-System/about-me/IDENTITY.md"), "utf8");
  const memory = readFileSync(path.join(targetDir, "0-System/memory/2026-05-28.md"), "utf8");

  assert.match(user, /Alex/);
  assert.match(identity, /Xiao X/);
  assert.match(memory, /远端写入、公开发布/);
  assert.equal(existsSync(path.join(targetDir, "0-System/about-me/BOOTSTRAP.md")), false);
  assert.equal(existsSync(path.join(targetDir, "5-Archive/bootstrap/BOOTSTRAP-2026-05-28.md")), true);
});
