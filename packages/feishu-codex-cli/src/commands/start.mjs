import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { appendRuntimeLog, describeBridgeConfig, writeRuntimeState } from "../bridge.mjs";
import { loadConfig } from "../config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUNTIME_PATH = path.resolve(__dirname, "../bridge-runtime.mjs");

export function runStartCommand(options = {}) {
  const config = loadConfig(options);
  const summary = describeBridgeConfig(config);
  const cwd = options.cwd || process.cwd();
  if (!options.spawnRuntime) {
    const state = {
      status: "prepared",
      preparedAt: new Date().toISOString(),
      ...summary
    };
    writeRuntimeState(cwd, state);
    appendRuntimeLog(cwd, "bridge runtime prepared");
    return `Bridge runtime prepared\n${JSON.stringify(state, null, 2)}`;
  }

  const spawnImpl = options.spawnImpl || spawn;
  const workdir = config.codexWorkdir || cwd;
  const env = {
    ...process.env,
    ...options.env,
    FEISHU_CODEX_WORKDIR: workdir,
    FEISHU_CODEX_LARK_PROFILE: config.larkProfile,
    FEISHU_CODEX_CHAT_ID: config.chatId,
    FEISHU_CODEX_USER_ID: config.userId,
    FEISHU_CODEX_THREAD_NAME: config.codexThreadName,
    FEISHU_CODEX_LOG_DIR: path.join(cwd, ".codex-x", "feishu-codex")
  };
  const child = spawnImpl(process.execPath, [RUNTIME_PATH], {
    cwd: workdir,
    env,
    detached: true,
    stdio: "ignore"
  });
  child.unref?.();
  const state = {
    status: "starting",
    startedAt: new Date().toISOString(),
    pid: child.pid,
    ...summary
  };
  writeRuntimeState(cwd, state);
  appendRuntimeLog(cwd, `bridge process started pid=${child.pid}`);
  return `Bridge process started\n${JSON.stringify(state, null, 2)}`;
}
