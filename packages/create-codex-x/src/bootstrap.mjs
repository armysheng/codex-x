import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { registerCodexMemoryDigestAutomation } from "./codex-automation.mjs";

function todayString(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function applyBootstrap(targetDir, answers, now = new Date(), options = {}) {
  const date = todayString(now);
  const aboutDir = path.join(targetDir, "0-System", "about-me");
  const memoryDir = path.join(targetDir, "0-System", "memory");
  const archiveDir = path.join(targetDir, "5-Archive", "bootstrap");

  mkdirSync(memoryDir, { recursive: true });
  mkdirSync(archiveDir, { recursive: true });

  writeFileSync(
    path.join(aboutDir, "USER.md"),
    `# USER.md\n\n- 姓名/称呼：${answers.ownerName}\n- 时区：\n- 语言偏好：${answers.language}\n- 沟通偏好：直接、简洁\n- 备注：初始化生成\n`
  );

  writeFileSync(
    path.join(aboutDir, "IDENTITY.md"),
    `# IDENTITY.md\n\n- 助手名称：${answers.assistantName}\n- 类型：本地 AI 搭子\n- 语气：直接、可靠、少套话\n- emoji（可选）：\n- 头像（可选）：\n`
  );

  writeFileSync(
    path.join(aboutDir, "SOUL.md"),
    [
      "# SOUL.md",
      "",
      "## 默认原则",
      "",
      `- 默认语言：${answers.language}`,
      `- 对这些动作先确认：${answers.confirmationBoundaries.join("、")}`,
      "- 记忆优先写入文件，不只依赖模型上下文",
      "- 面向本地优先的工作流，先把事情做成"
    ].join("\n")
  );

  writeFileSync(
    path.join(targetDir, "0-System", "status.md"),
    `# Status\n\n- 当前阶段：完成首次初始化\n- 当前助手：${answers.assistantName}\n- 当前用户：${answers.ownerName}\n`
  );

  writeFileSync(
    path.join(targetDir, "0-System", "context.md"),
    `# Context\n\n- ${date}：完成 ${answers.assistantName} 工作区初始化，后续按需补充项目上下文。\n`
  );

  writeFileSync(
    path.join(memoryDir, `${date}.md`),
    [
      `# ${date}`,
      "",
      "## 当天主线",
      `- 完成 ${answers.assistantName} 的首次初始化。`,
      "",
      "## 具体动作",
      `- 确认用户称呼为 ${answers.ownerName}。`,
      `- 默认语言设为 ${answers.language}。`,
      `- 记录需要先确认的动作：${answers.confirmationBoundaries.join("、")}。`
    ].join("\n")
  );

  const bootstrapPath = path.join(aboutDir, "BOOTSTRAP.md");
  if (existsSync(bootstrapPath)) {
    renameSync(bootstrapPath, path.join(archiveDir, `BOOTSTRAP-${date}.md`));
  }

  const result = {};
  if (options.registerCodexAutomation !== false) {
    result.codexAutomation = registerCodexMemoryDigestAutomation({
      workspaceDir: targetDir,
      codexHome: options.codexHome,
      repoRoot: options.repoRoot,
      nowMs: options.nowMs || now.getTime()
    });
  }
  return result;
}

export function readAnswersFile(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}
