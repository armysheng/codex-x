import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { loadConfig } from "../config.mjs";

function defaultCommandExists(name) {
  try {
    execFileSync("sh", ["-lc", `command -v ${name}`], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function runDoctorCommand(options = {}) {
  const cwd = options.cwd || process.cwd();
  const env = options.env || process.env;
  const commandExists = options.commandExists || defaultCommandExists;
  const config = loadConfig({ cwd, env });

  const report = {
    ready: false,
    config: {
      larkProfile: config.larkProfile,
      chatId: Boolean(config.chatId),
      userId: Boolean(config.userId),
      codexWorkdir: config.codexWorkdir,
      codexThreadName: config.codexThreadName
    },
    dependencies: {
      codex: commandExists("codex"),
      larkCli: commandExists("lark-cli")
    },
    workspace: {
      path: config.codexWorkdir || "",
      exists: Boolean(config.codexWorkdir) && existsSync(config.codexWorkdir)
    },
    nextActions: []
  };

  if (!report.dependencies.codex) {
    report.nextActions.push("安装或修复 `codex` 命令，确保终端里可以直接调用。");
  }
  if (!report.dependencies.larkCli) {
    report.nextActions.push("安装或修复 `lark-cli`，并确认它在 PATH 中可用。");
  }
  if (!report.config.larkProfile) {
    report.nextActions.push("配置 `larkProfile`，让桥接知道该使用哪个 `lark-cli` profile。");
  }
  if (!report.workspace.path) {
    report.nextActions.push("配置 `codexWorkdir`，指向你的本地 Codex 工作区。");
  } else if (!report.workspace.exists) {
    report.nextActions.push("当前 `codexWorkdir` 不存在，请修正路径或先创建工作区。");
  }

  report.ready =
    report.dependencies.codex &&
    report.dependencies.larkCli &&
    report.workspace.exists &&
    Boolean(report.config.larkProfile);

  return JSON.stringify(report, null, 2);
}
