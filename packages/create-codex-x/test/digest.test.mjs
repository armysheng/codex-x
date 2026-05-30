import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { runDigest } from "../src/digest.mjs";

function setupWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "codex-x-digest-"));
  const systemDir = path.join(root, "0-System");
  const memoryDir = path.join(systemDir, "memory");
  mkdirSync(memoryDir, { recursive: true });
  writeFileSync(
    path.join(memoryDir, "2026-05-29.md"),
    [
      "# 2026-05-29",
      "",
      "## 当天主线",
      "- 完成 README 初版整理。",
      "",
      "## 具体动作",
      "- 补了结构说明。",
      "- 调整了初始化流程。"
    ].join("\n")
  );
  writeFileSync(
    path.join(memoryDir, "2026-05-30.md"),
    [
      "# 2026-05-30",
      "",
      "## 当天主线",
      "- 增加一键安装脚本。",
      "",
      "## 具体动作",
      "- 新增 install.sh。",
      "- 补了 README 首页展示图。"
    ].join("\n")
  );
  writeFileSync(path.join(systemDir, "status.md"), "# Status\n\n- 旧状态\n");
  writeFileSync(path.join(systemDir, "context.md"), "# Context\n\n- 旧上下文\n");
  return root;
}

test("digest summarizes today and yesterday memory", () => {
  const root = setupWorkspace();
  const output = runDigest({
    cwd: root,
    today: "2026-05-30",
    writeStatus: false,
    writeContext: false
  });

  assert.match(output, /2026-05-30/);
  assert.match(output, /增加一键安装脚本/);
  assert.match(output, /README 首页展示图/);
  assert.match(output, /2026-05-29/);
});

test("digest can write status and context", () => {
  const root = setupWorkspace();
  runDigest({
    cwd: root,
    today: "2026-05-30",
    writeStatus: true,
    writeContext: true
  });

  const status = readFileSync(path.join(root, "0-System", "status.md"), "utf8");
  const context = readFileSync(path.join(root, "0-System", "context.md"), "utf8");

  assert.match(status, /当前阶段/);
  assert.match(status, /增加一键安装脚本/);
  assert.match(context, /2026-05-30/);
  assert.match(context, /README 首页展示图/);
});
