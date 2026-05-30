#!/usr/bin/env node

import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const cliPath = path.join(repoRoot, "bin", "codex-x.mjs");

const keep = process.argv.includes("--keep");
const tempRoot = mkdtempSync(path.join(os.tmpdir(), "codex-x-demo-"));
const workspaceDir = path.join(tempRoot, "my-workspace");
const codexHome = path.join(tempRoot, ".codex");

const env = {
  ...process.env,
  CODEX_HOME: codexHome
};

const result = spawnSync(
  process.execPath,
  [cliPath, "init", "--yes", workspaceDir],
  {
    cwd: repoRoot,
    env,
    encoding: "utf8"
  }
);

if (result.error) {
  throw result.error;
}

if (result.status !== 0) {
  process.stderr.write(result.stderr);
  process.exit(result.status || 1);
}

const automationPath = path.join(
  codexHome,
  "automations",
  "codex-x-memory-digest",
  "automation.toml"
);
const memoryDir = path.join(workspaceDir, "0-System", "memory");
const memoryFiles = listFiles(memoryDir).filter((file) => file.endsWith(".md"));

const lines = [
  "$ npm run demo",
  "",
  result.stdout.trim(),
  "",
  "Workspace memory tree:",
  renderTree(workspaceDir, [
    "AGENTS.md",
    "CLAUDE.md",
    "HEARTBEAT.md",
    "0-System/status.md",
    "0-System/context.md",
    "0-System/about-me/USER.md",
    "0-System/about-me/IDENTITY.md",
    "0-System/about-me/SOUL.md",
    "0-System/about-me/MEMORY.md",
    "0-System/about-me/TOOLS.md",
    ...memoryFiles.map((file) => path.join("0-System/memory", file))
  ]),
  "",
  "Codex automation:",
  `  ${automationPath}`,
  "",
  summarizeAutomation(automationPath),
  "",
  keep
    ? `Demo files kept at: ${tempRoot}`
    : "Demo files were created in a temporary directory and removed."
];

console.log(lines.join("\n"));

if (!keep) {
  rmSync(tempRoot, { recursive: true, force: true });
}

function listFiles(dir) {
  if (!existsSync(dir)) return [];
  return spawnSync("find", [dir, "-maxdepth", "1", "-type", "f"], { encoding: "utf8" })
    .stdout
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((file) => path.basename(file))
    .sort();
}

function renderTree(root, relativePaths) {
  const existing = relativePaths.filter((relativePath) => existsSync(path.join(root, relativePath)));
  return existing.map((relativePath) => `  ${relativePath}`).join("\n");
}

function summarizeAutomation(filePath) {
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    return "  automation.toml was not created";
  }
  const source = readFileSync(filePath, "utf8");
  const name = readTomlString(source, "name");
  const rrule = readTomlString(source, "rrule");
  const promptMentionsDailyMemory = source.includes("daily memory");
  return [
    `  name: ${name}`,
    `  schedule: ${rrule}`,
    `  prompt-native daily memory: ${promptMentionsDailyMemory ? "yes" : "no"}`
  ].join("\n");
}

function readTomlString(source, key) {
  const match = source.match(new RegExp(`^${key}\\s*=\\s*"([^"]+)"`, "m"));
  return match ? match[1] : "(missing)";
}
