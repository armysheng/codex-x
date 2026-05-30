import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { runDoctorCommand } from "../src/commands/doctor.mjs";
import { main } from "../src/commands/index.mjs";

test("doctor reports config and dependency readiness", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "feishu-codex-doctor-"));
  mkdirSync(path.join(cwd, "workspace"), { recursive: true });
  writeFileSync(
    path.join(cwd, "feishu-codex.config.json"),
    JSON.stringify({
      larkProfile: "doctor-profile",
      codexWorkdir: path.join(cwd, "workspace"),
      codexThreadName: "Feishu - doctor"
    })
  );

  const output = runDoctorCommand({
    cwd,
    env: {},
    commandExists: (name) => name === "codex" || name === "lark-cli"
  });

  const report = JSON.parse(output);
  assert.equal(report.ready, true);
  assert.equal(report.config.larkProfile, "doctor-profile");
  assert.equal(report.dependencies.codex, true);
  assert.equal(report.dependencies.larkCli, true);
  assert.equal(report.workspace.exists, true);
  assert.deepEqual(report.nextActions, []);
});

test("doctor fails readiness when workspace or commands are missing", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "feishu-codex-doctor-missing-"));
  const output = runDoctorCommand({
    cwd,
    env: {},
    commandExists: () => false
  });
  const report = JSON.parse(output);
  assert.equal(report.ready, false);
  assert.equal(report.dependencies.codex, false);
  assert.equal(report.dependencies.larkCli, false);
  assert.equal(report.workspace.exists, false);
  assert.ok(report.nextActions.length >= 2);
  assert.match(report.nextActions.join("\n"), /codexWorkdir|lark-cli|codex/);
});

test("CLI main supports doctor command", async () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "feishu-codex-doctor-main-"));
  mkdirSync(path.join(cwd, "workspace"), { recursive: true });
  writeFileSync(
    path.join(cwd, "feishu-codex.config.json"),
    JSON.stringify({ codexWorkdir: path.join(cwd, "workspace") })
  );
  const messages = [];
  await main(["doctor"], {
    cwd,
    env: {},
    commandExists: () => true,
    log: (message) => messages.push(String(message))
  });
  const report = JSON.parse(messages.join("\n"));
  assert.equal(report.ready, true);
});
