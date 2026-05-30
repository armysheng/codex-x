import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const AUTOMATION_ID = "codex-x-memory-digest";
const DEFAULT_RRULE = "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU;BYHOUR=23;BYMINUTE=40";

export function registerCodexMemoryDigestAutomation(options = {}) {
  const workspaceDir = path.resolve(options.workspaceDir || process.cwd());
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
      createdAt,
      updatedAt: nowMs
    })
  );

  return {
    id: AUTOMATION_ID,
    path: automationPath
  };
}

function renderAutomationToml({ workspaceDir, createdAt, updatedAt }) {
  const prompt = [
    "这是 codex-x 工作区的每日记忆整理任务。",
    `工作区：${workspaceDir}`,
    "",
    "请先读取工作区内的 AGENTS.md / CLAUDE.md（如果存在），遵守其中的记忆、安全和外部动作规则。",
    "然后直接由 Codex 模型整理本地记忆文件。不要调用外部服务，不要公开发布，不要发送消息。",
    "",
    "整理范围：",
    "- 读取今天和昨天的 0-System/memory/YYYY-MM-DD.md；如果今天文件不存在，可以创建。",
    "- 读取 0-System/status.md 和 0-System/context.md，用来理解当前阶段并去重。",
    "- 如有必要，读取 0-System/about-me/MEMORY.md，但只保留稳定偏好和长期结论。",
    "",
    "写入要求：",
    "- 尽量把重要信息写进今天的 daily memory，包括关键决策、项目进展、资源变化、工具变化、错误教训、用户明确偏好、承诺过的待办。",
    "- 每条重要信息尽量带上证据线索，例如文件路径、命令结果、会话中明确确认的结论或可复查来源。",
    "- 用简短、可追溯的摘要更新 0-System/status.md。",
    "- 当阶段背景变化时更新 0-System/context.md。",
    "- 只有稳定偏好或长期结论才更新 0-System/about-me/MEMORY.md，避免把临时细节塞进长期记忆。",
    "- 只整理已有本地事实；推断必须标注；证据不足写待确认；不要编造。",
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
