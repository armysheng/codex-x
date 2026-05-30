import { writeFileSync } from "node:fs";
import path from "node:path";
import { formatExampleEnv, loadConfig } from "../config.mjs";

export function runInitCommand(options = {}) {
  const cwd = options.cwd || process.cwd();
  const config = loadConfig(options);
  if (options.printExample) {
    return `${formatExampleEnv()}\n`;
  }
  if (options.writeConfig) {
    const outputPath = path.join(cwd, "feishu-codex.config.json");
    writeFileSync(
      outputPath,
      `${JSON.stringify(
        {
          appId: config.appId,
          appSecret: config.appSecret,
          larkProfile: config.larkProfile,
          chatId: config.chatId,
          userId: config.userId,
          codexWorkdir: config.codexWorkdir,
          codexThreadName: config.codexThreadName
        },
        null,
        2
      )}\n`
    );
    return `Wrote feishu-codex.config.json to ${outputPath}`;
  }
  return [
    "feishu-codex-cli 初始化说明：",
    "",
    "1. 准备飞书应用凭据",
    "2. 写入 `.env` 或 `feishu-codex.config.json`",
    "3. 设置 `CODEX_WORKDIR` 指向你的本地工作区",
    "",
    `当前线程名默认值：${config.codexThreadName}`
  ].join("\n");
}
