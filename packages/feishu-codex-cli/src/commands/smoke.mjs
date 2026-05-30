import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "../config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUNTIME_PATH = path.resolve(__dirname, "../bridge-runtime.mjs");

export function runSmokeCommand(options = {}) {
  const cwd = options.cwd || process.cwd();
  const env = options.env || process.env;
  const config = loadConfig({ cwd, env });
  const runImpl = options.runImpl || spawnSync;
  const workdir = config.codexWorkdir || cwd;
  const result = runImpl(process.execPath, [RUNTIME_PATH], {
    cwd: workdir,
    env: {
      ...process.env,
      ...env,
      FEISHU_CODEX_DRY_RUN: "1",
      FEISHU_CODEX_WORKDIR: workdir,
      FEISHU_CODEX_LARK_PROFILE: config.larkProfile,
      FEISHU_CODEX_CHAT_ID: config.chatId,
      FEISHU_CODEX_USER_ID: config.userId,
      FEISHU_CODEX_THREAD_NAME: config.codexThreadName,
      FEISHU_CODEX_LOG_DIR: path.join(cwd, ".codex-x", "feishu-codex")
    },
    encoding: "utf8"
  });

  if (result.status !== 0) {
    throw new Error(`Bridge smoke test failed: ${result.stderr || result.stdout || result.status}`);
  }

  return `Bridge smoke test passed\n${String(result.stdout || "").trim()}`;
}
