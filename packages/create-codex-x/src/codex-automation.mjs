import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AUTOMATION_ID = "codex-x-memory-digest";
const DEFAULT_RRULE = "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU;BYHOUR=23;BYMINUTE=40";
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));

export function registerCodexMemoryDigestAutomation(options = {}) {
  const workspaceDir = path.resolve(options.workspaceDir || process.cwd());
  const repoRoot = path.resolve(options.repoRoot || path.join(MODULE_DIR, "../../.."));
  const codexHome = path.resolve(options.codexHome || process.env.CODEX_HOME || path.join(os.homedir(), ".codex"));
  const nowMs = options.nowMs || Date.now();
  const automationDir = path.join(codexHome, "automations", AUTOMATION_ID);
  const automationPath = path.join(automationDir, "automation.toml");
  const existing = existsSync(automationPath) ? readFileSync(automationPath, "utf8") : "";
  const createdAt = readNumberField(existing, "created_at") || nowMs;

  mkdirSync(automationDir, { recursive: true });
  writeFileSync(
    automationPath,
    renderAutomationToml({
      workspaceDir,
      command: [
        "node",
        shellQuote(path.join(repoRoot, "bin", "codex-x.mjs")),
        "digest",
        shellQuote(workspaceDir),
        "--write-status",
        "--write-context"
      ].join(" "),
      createdAt,
      updatedAt: nowMs
    })
  );

  return {
    id: AUTOMATION_ID,
    path: automationPath
  };
}

function renderAutomationToml({ workspaceDir, command, createdAt, updatedAt }) {
  const prompt = [
    "这是 codex-x 工作区的每日记忆整理任务。",
    `工作区：${workspaceDir}`,
    "",
    "请先读取工作区内的 AGENTS.md / CLAUDE.md（如果存在），遵守其中的记忆、安全和外部动作规则。",
    "然后执行下面这条本地整理命令：",
    command,
    "",
    "执行后检查 0-System/status.md、0-System/context.md，以及今天/昨天的 0-System/memory/YYYY-MM-DD.md。",
    "只整理已有本地记忆事实；不要编造；不要执行远端写入、公开发布或发送消息。",
    "最后输出简短报告：本次整理写入了哪些文件、有没有缺失日记或证据不足的事项。"
  ].join("\n");

  return [
    "version = 1",
    `id = ${tomlString(AUTOMATION_ID)}`,
    `kind = ${tomlString("cron")}`,
    `name = ${tomlString("codex-x 每日记忆整理")}`,
    `prompt = ${tomlString(prompt)}`,
    `status = ${tomlString("ACTIVE")}`,
    `rrule = ${tomlString(DEFAULT_RRULE)}`,
    `execution_environment = ${tomlString("worktree")}`,
    `cwds = [${tomlString(workspaceDir)}]`,
    `created_at = ${createdAt}`,
    `updated_at = ${updatedAt}`,
    ""
  ].join("\n");
}

function tomlString(value) {
  return JSON.stringify(value);
}

function readNumberField(source, fieldName) {
  const match = source.match(new RegExp(`^${fieldName}\\s*=\\s*(\\d+)`, "m"));
  return match ? Number(match[1]) : 0;
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}
