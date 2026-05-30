import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { existsSync, mkdirSync, readFileSync, mkdtempSync, writeFileSync } from "node:fs";
import { formatExampleEnv, loadConfig } from "../src/config.mjs";
import { runStartCommand } from "../src/commands/start.mjs";
import { runStatusCommand } from "../src/commands/status.mjs";
import { runLogsCommand } from "../src/commands/logs.mjs";
import { runInitCommand } from "../src/commands/init.mjs";
import { main } from "../src/commands/index.mjs";
import { runStopCommand } from "../src/commands/stop.mjs";
import { runSmokeCommand } from "../src/commands/smoke.mjs";

test("loads config from file and environment", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "feishu-codex-config-"));
  writeFileSync(
    path.join(cwd, "feishu-codex.config.json"),
    JSON.stringify({ chatId: "chat-from-file", codexWorkdir: "./workspace", larkProfile: "file-profile" })
  );
  const config = loadConfig({
    cwd,
    env: {
      FEISHU_APP_ID: "cli_123",
      FEISHU_APP_SECRET: "secret_123",
      FEISHU_USER_ID: "user_demo"
    }
  });

  assert.equal(config.appId, "cli_123");
  assert.equal(config.appSecret, "secret_123");
  assert.equal(config.chatId, "chat-from-file");
  assert.equal(config.userId, "user_demo");
  assert.equal(config.codexWorkdir, "./workspace");
  assert.equal(config.larkProfile, "file-profile");
});

test("loads config from .env when present", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "feishu-codex-env-"));
  writeFileSync(
    path.join(cwd, ".env"),
    [
      "FEISHU_APP_ID=cli_env",
      "FEISHU_APP_SECRET=secret_env",
      "FEISHU_LARK_PROFILE=env-profile",
      "FEISHU_CHAT_ID=chat_env",
      "CODEX_WORKDIR=./env-workspace",
      "CODEX_THREAD_NAME=Feishu - env"
    ].join("\n")
  );

  const config = loadConfig({ cwd, env: {} });
  assert.equal(config.appId, "cli_env");
  assert.equal(config.appSecret, "secret_env");
  assert.equal(config.larkProfile, "env-profile");
  assert.equal(config.chatId, "chat_env");
  assert.equal(config.codexWorkdir, "./env-workspace");
  assert.equal(config.codexThreadName, "Feishu - env");
});

test("formats example env without private defaults", () => {
  const envExample = formatExampleEnv();
  assert.match(envExample, /FEISHU_APP_ID=cli_xxx/);
  assert.match(envExample, /FEISHU_LARK_PROFILE=codex-x/);
  assert.match(envExample, /CODEX_THREAD_NAME=Feishu - codex-x/);
  assert.doesNotMatch(envExample, /api\.iaigc\.fun|router\.iaigc|ou_[A-Za-z0-9]+|oc_[A-Za-z0-9]+/);
});

test("start command creates runtime state and log files", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "feishu-codex-start-"));
  mkdirSync(path.join(cwd, "workspace"), { recursive: true });
  const output = runStartCommand({
    cwd,
    env: {
      FEISHU_APP_ID: "cli_123",
      FEISHU_APP_SECRET: "secret_123",
      CODEX_WORKDIR: path.join(cwd, "workspace"),
      CODEX_THREAD_NAME: "Feishu - demo"
    }
  });

  assert.match(output, /Bridge runtime prepared/);
  const state = JSON.parse(readFileSync(path.join(cwd, ".codex-x", "feishu-codex", "state.json"), "utf8"));
  assert.equal(state.status, "prepared");
  assert.equal(state.codexThreadName, "Feishu - demo");
  assert.equal(state.codexWorkdir, path.join(cwd, "workspace"));
  const logText = readFileSync(path.join(cwd, ".codex-x", "feishu-codex", "bridge.log"), "utf8");
  assert.match(logText, /prepared/);
});

test("status and logs commands read runtime artifacts", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "feishu-codex-status-"));
  mkdirSync(path.join(cwd, "workspace"), { recursive: true });
  runStartCommand({
    cwd,
    env: {
      FEISHU_APP_ID: "cli_123",
      FEISHU_APP_SECRET: "secret_123",
      CODEX_WORKDIR: path.join(cwd, "workspace")
    }
  });

  const status = runStatusCommand({ cwd });
  const logs = runLogsCommand({ cwd });

  assert.match(status, /"status": "prepared"/);
  assert.match(logs, /bridge runtime prepared/);
});

test("status command marks runtime as running when pid is alive", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "feishu-codex-status-live-"));
  mkdirSync(path.join(cwd, ".codex-x", "feishu-codex"), { recursive: true });
  writeFileSync(
    path.join(cwd, ".codex-x", "feishu-codex", "state.json"),
    JSON.stringify({ status: "starting", pid: 7373, codexThreadName: "Feishu - live" }, null, 2)
  );
  const output = runStatusCommand({
    cwd,
    isProcessAlive: (pid) => pid === 7373
  });
  const state = JSON.parse(output);
  assert.equal(state.status, "running");
});

test("status command marks runtime as stale when pid is dead", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "feishu-codex-status-dead-"));
  mkdirSync(path.join(cwd, ".codex-x", "feishu-codex"), { recursive: true });
  writeFileSync(
    path.join(cwd, ".codex-x", "feishu-codex", "state.json"),
    JSON.stringify({ status: "starting", pid: 8383, codexThreadName: "Feishu - dead" }, null, 2)
  );
  const output = runStatusCommand({
    cwd,
    isProcessAlive: () => false
  });
  const state = JSON.parse(output);
  assert.equal(state.status, "stale");
});

test("start command can spawn runtime process and persist pid", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "feishu-codex-spawn-"));
  mkdirSync(path.join(cwd, "workspace"), { recursive: true });
  const calls = [];
  const output = runStartCommand({
    cwd,
    spawnRuntime: true,
    env: {
      FEISHU_LARK_PROFILE: "bridge-profile",
      CODEX_WORKDIR: path.join(cwd, "workspace")
    },
    spawnImpl: (cmd, args, options) => {
      calls.push({ cmd, args, options });
      return {
        pid: 4242,
        unref() {},
        on() {},
        stdout: { on() {} },
        stderr: { on() {} }
      };
    }
  });

  assert.equal(calls.length, 1);
  assert.match(output, /Bridge process started/);
  const state = JSON.parse(readFileSync(path.join(cwd, ".codex-x", "feishu-codex", "state.json"), "utf8"));
  assert.equal(state.status, "starting");
  assert.equal(state.pid, 4242);
  assert.equal(state.larkProfile, "bridge-profile");
});

test("init command can write a local config file", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "feishu-codex-init-"));
  const output = runInitCommand({
    cwd,
    writeConfig: true,
    env: {
      FEISHU_APP_ID: "cli_write",
      FEISHU_APP_SECRET: "secret_write",
      CODEX_WORKDIR: "./workspace"
    }
  });

  const configPath = path.join(cwd, "feishu-codex.config.json");
  assert.equal(existsSync(configPath), true);
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  assert.equal(config.appId, "cli_write");
  assert.equal(config.appSecret, "secret_write");
  assert.equal(config.codexWorkdir, "./workspace");
  assert.match(output, /Wrote feishu-codex\.config\.json/);
});

test("CLI main forwards --write-config to init command", async () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "feishu-codex-cli-main-"));
  const messages = [];
  const originalCwd = process.cwd();
  process.chdir(cwd);
  try {
    await main(["init", "--write-config"], {
      log: (message) => messages.push(String(message))
    });
  } finally {
    process.chdir(originalCwd);
  }
  assert.equal(existsSync(path.join(cwd, "feishu-codex.config.json")), true);
  assert.match(messages.join("\n"), /Wrote feishu-codex\.config\.json/);
});

test("CLI main starts bridge runtime instead of prepare mode", async () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "feishu-codex-cli-start-"));
  mkdirSync(path.join(cwd, "workspace"), { recursive: true });
  const messages = [];
  const originalCwd = process.cwd();
  const calls = [];
  process.chdir(cwd);
  try {
    await main(["bridge", "start"], {
      log: (message) => messages.push(String(message)),
      spawnImpl: (cmd, args, options) => {
        calls.push({ cmd, args, options });
        return { pid: 5151, unref() {}, on() {}, stdout: { on() {} }, stderr: { on() {} } };
      },
      env: {
        FEISHU_LARK_PROFILE: "cli-profile",
        CODEX_WORKDIR: path.join(cwd, "workspace")
      }
    });
  } finally {
    process.chdir(originalCwd);
  }
  assert.equal(calls.length, 1);
  assert.match(messages.join("\n"), /Bridge process started/);
});

test("stop command stops runtime and updates state", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "feishu-codex-stop-"));
  mkdirSync(path.join(cwd, ".codex-x", "feishu-codex"), { recursive: true });
  writeFileSync(
    path.join(cwd, ".codex-x", "feishu-codex", "state.json"),
    JSON.stringify({ status: "starting", pid: 6262, codexThreadName: "Feishu - demo" }, null, 2)
  );
  const calls = [];
  const output = runStopCommand({
    cwd,
    killImpl: (pid, signal) => calls.push({ pid, signal })
  });
  assert.deepEqual(calls, [{ pid: 6262, signal: "SIGTERM" }]);
  assert.match(output, /Bridge process stopped/);
  const state = JSON.parse(readFileSync(path.join(cwd, ".codex-x", "feishu-codex", "state.json"), "utf8"));
  assert.equal(state.status, "stopped");
  assert.equal(state.pid, null);
});

test("smoke command runs bridge runtime in dry-run mode", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "feishu-codex-smoke-"));
  mkdirSync(path.join(cwd, "workspace"), { recursive: true });
  const calls = [];
  const output = runSmokeCommand({
    cwd,
    env: {
      FEISHU_LARK_PROFILE: "smoke-profile",
      CODEX_WORKDIR: path.join(cwd, "workspace")
    },
    runImpl: (cmd, args, options) => {
      calls.push({ cmd, args, options });
      return { status: 0, stdout: "dry-run ok", stderr: "" };
    }
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].options.env.FEISHU_CODEX_DRY_RUN, "1");
  assert.match(output, /Bridge smoke test passed/);
});

test("CLI main supports bridge smoke", async () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "feishu-codex-smoke-main-"));
  mkdirSync(path.join(cwd, "workspace"), { recursive: true });
  const messages = [];
  const calls = [];
  await main(["bridge", "smoke"], {
    cwd,
    env: {
      FEISHU_LARK_PROFILE: "smoke-profile",
      CODEX_WORKDIR: path.join(cwd, "workspace")
    },
    runImpl: (cmd, args, options) => {
      calls.push({ cmd, args, options });
      return { status: 0, stdout: "dry-run ok", stderr: "" };
    },
    log: (message) => messages.push(String(message))
  });
  assert.equal(calls.length, 1);
  assert.match(messages.join("\n"), /Bridge smoke test passed/);
});
