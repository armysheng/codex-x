import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export const DEFAULT_CONFIG = {
  appId: "",
  appSecret: "",
  larkProfile: "codex-x",
  chatId: "",
  userId: "",
  codexWorkdir: "",
  codexThreadName: "Feishu - codex-x"
};

export function loadConfig({ cwd = process.cwd(), env = process.env } = {}) {
  const filePath = path.join(cwd, "feishu-codex.config.json");
  const fileConfig = existsSync(filePath) ? JSON.parse(readFileSync(filePath, "utf8")) : {};
  const envFileConfig = loadDotEnv(path.join(cwd, ".env"));
  return {
    ...DEFAULT_CONFIG,
    ...fileConfig,
    appId: env.FEISHU_APP_ID || envFileConfig.FEISHU_APP_ID || fileConfig.appId || DEFAULT_CONFIG.appId,
    appSecret: env.FEISHU_APP_SECRET || envFileConfig.FEISHU_APP_SECRET || fileConfig.appSecret || DEFAULT_CONFIG.appSecret,
    larkProfile: env.FEISHU_LARK_PROFILE || envFileConfig.FEISHU_LARK_PROFILE || fileConfig.larkProfile || DEFAULT_CONFIG.larkProfile,
    chatId: env.FEISHU_CHAT_ID || envFileConfig.FEISHU_CHAT_ID || fileConfig.chatId || DEFAULT_CONFIG.chatId,
    userId: env.FEISHU_USER_ID || envFileConfig.FEISHU_USER_ID || fileConfig.userId || DEFAULT_CONFIG.userId,
    codexWorkdir: env.CODEX_WORKDIR || envFileConfig.CODEX_WORKDIR || fileConfig.codexWorkdir || DEFAULT_CONFIG.codexWorkdir,
    codexThreadName: env.CODEX_THREAD_NAME || envFileConfig.CODEX_THREAD_NAME || fileConfig.codexThreadName || DEFAULT_CONFIG.codexThreadName
  };
}

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) return {};
  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  const values = {};
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    values[key] = value;
  }
  return values;
}

export function formatExampleEnv() {
  return [
    "FEISHU_APP_ID=cli_xxx",
    "FEISHU_APP_SECRET=secret_xxx",
    "FEISHU_LARK_PROFILE=codex-x",
    "FEISHU_CHAT_ID=",
    "FEISHU_USER_ID=",
    "CODEX_WORKDIR=./demo-workspace",
    "CODEX_THREAD_NAME=Feishu - codex-x"
  ].join("\n");
}
