import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { applyBootstrap } from "../src/bootstrap.mjs";
import { main } from "../src/index.mjs";
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
  applyBootstrap(targetDir, answers, new Date("2026-05-28T08:00:00Z"), {
    registerCodexAutomation: false
  });

  const user = readFileSync(path.join(targetDir, "0-System/about-me/USER.md"), "utf8");
  const identity = readFileSync(path.join(targetDir, "0-System/about-me/IDENTITY.md"), "utf8");
  const memory = readFileSync(path.join(targetDir, "0-System/memory/2026-05-28.md"), "utf8");

  assert.match(user, /Alex/);
  assert.match(identity, /Xiao X/);
  assert.match(memory, /远端写入、公开发布/);
  assert.equal(existsSync(path.join(targetDir, "0-System/about-me/BOOTSTRAP.md")), false);
  assert.equal(existsSync(path.join(targetDir, "5-Archive/bootstrap/BOOTSTRAP-2026-05-28.md")), true);
});

test("bootstrap registers a Codex daily memory automation", () => {
  const tempRoot = mkdtempSync(path.join(tmpdir(), "codex-x-automation-"));
  const targetDir = path.join(tempRoot, "workspace");
  const codexHome = path.join(tempRoot, ".codex");
  copyTemplate(templateDir, targetDir);
  const answers = normalizeAnswers({
    ownerName: "Alex",
    assistantName: "Xiao X",
    language: "中文",
    confirmationBoundaries: ["远端写入"]
  });

  const result = applyBootstrap(targetDir, answers, new Date("2026-05-28T08:00:00Z"), {
    codexHome,
    repoRoot,
    nowMs: 1779955200000
  });

  const automationPath = path.join(
    codexHome,
    "automations",
    "codex-x-memory-digest",
    "automation.toml"
  );
  const automation = readFileSync(automationPath, "utf8");

  assert.equal(result.codexAutomation.path, automationPath);
  assert.match(automation, /id = "codex-x-memory-digest"/);
  assert.match(automation, /kind = "cron"/);
  assert.match(automation, /name = "codex-x 每日记忆整理"/);
  assert.match(automation, /rrule = "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU;BYHOUR=23;BYMINUTE=40"/);
  assert.match(automation, /execution_environment = "worktree"/);
  assert.match(automation, new RegExp(escapeRegExp(`cwds = ["${targetDir}"]`)));
  assert.match(automation, new RegExp(escapeRegExp(`node '${path.join(repoRoot, "bin", "codex-x.mjs")}' digest '${targetDir}' --write-status --write-context`)));
});

test("automation install registers Codex digest automation for an existing workspace", async () => {
  const tempRoot = mkdtempSync(path.join(tmpdir(), "codex-x-automation-command-"));
  const targetDir = path.join(tempRoot, "workspace");
  const codexHome = path.join(tempRoot, ".codex");
  copyTemplate(templateDir, targetDir);

  await main(["automation", "install", targetDir], {
    codexHome,
    repoRoot,
    nowMs: 1779955200000
  });

  const automation = readFileSync(
    path.join(codexHome, "automations", "codex-x-memory-digest", "automation.toml"),
    "utf8"
  );
  assert.match(automation, /name = "codex-x 每日记忆整理"/);
  assert.match(automation, new RegExp(escapeRegExp(`cwds = ["${targetDir}"]`)));
});

test("init can skip Codex automation when disabled by flag", async () => {
  const tempRoot = mkdtempSync(path.join(tmpdir(), "codex-x-no-automation-"));
  const targetDir = path.join(tempRoot, "workspace");
  const codexHome = path.join(tempRoot, ".codex");

  await main(["--yes", "--no-automation", targetDir], {
    codexHome,
    repoRoot,
    nowMs: 1779955200000
  });

  assert.equal(
    existsSync(path.join(codexHome, "automations", "codex-x-memory-digest", "automation.toml")),
    false
  );
});

test("answers file can disable Codex automation", async () => {
  const tempRoot = mkdtempSync(path.join(tmpdir(), "codex-x-answers-no-automation-"));
  const targetDir = path.join(tempRoot, "workspace");
  const codexHome = path.join(tempRoot, ".codex");
  const answersPath = path.join(tempRoot, "answers.json");
  writeFileSync(
    answersPath,
    JSON.stringify({
      ownerName: "Alex",
      assistantName: "Xiao X",
      language: "中文",
      registerCodexAutomation: false
    })
  );

  await main(["--answers", answersPath, targetDir], {
    codexHome,
    repoRoot,
    nowMs: 1779955200000
  });

  assert.equal(
    existsSync(path.join(codexHome, "automations", "codex-x-memory-digest", "automation.toml")),
    false
  );
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
