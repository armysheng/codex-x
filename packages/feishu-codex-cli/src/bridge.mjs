import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export function describeBridgeConfig(config) {
  return {
    hasAppId: Boolean(config.appId),
    hasAppSecret: Boolean(config.appSecret),
    larkProfile: config.larkProfile || "",
    hasChatId: Boolean(config.chatId),
    hasUserId: Boolean(config.userId),
    codexWorkdir: config.codexWorkdir || "",
    codexThreadName: config.codexThreadName || ""
  };
}

export function getRuntimeDir(cwd = process.cwd()) {
  return path.join(cwd, ".codex-x", "feishu-codex");
}

export function ensureRuntimeDir(cwd = process.cwd()) {
  const runtimeDir = getRuntimeDir(cwd);
  mkdirSync(runtimeDir, { recursive: true });
  return runtimeDir;
}

export function writeRuntimeState(cwd, state) {
  const runtimeDir = ensureRuntimeDir(cwd);
  const statePath = path.join(runtimeDir, "state.json");
  writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
  return statePath;
}

export function readRuntimeState(cwd) {
  const statePath = path.join(getRuntimeDir(cwd), "state.json");
  if (!existsSync(statePath)) return null;
  return JSON.parse(readFileSync(statePath, "utf8"));
}

export function appendRuntimeLog(cwd, message) {
  const runtimeDir = ensureRuntimeDir(cwd);
  const logPath = path.join(runtimeDir, "bridge.log");
  appendFileSync(logPath, `[${new Date().toISOString()}] ${message}\n`);
  return logPath;
}

export function readRuntimeLog(cwd) {
  const logPath = path.join(getRuntimeDir(cwd), "bridge.log");
  if (!existsSync(logPath)) return "";
  return readFileSync(logPath, "utf8");
}
