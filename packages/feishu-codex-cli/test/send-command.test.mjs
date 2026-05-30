import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { main } from "../src/commands/index.mjs";

const fixtureDir = join(tmpdir(), "codex-x-feishu-send-command-test");
mkdirSync(fixtureDir, { recursive: true });
const pngPath = join(fixtureDir, "chart.png");
writeFileSync(pngPath, "png");

test("send command renders a reply plan JSON for local assets", async () => {
  const outputs = [];
  await main(
    ["send", `看图：![chart](${pngPath})`],
    {
      log: (message) => outputs.push(String(message))
    }
  );

  const payload = JSON.parse(outputs.join("\n"));
  assert.deepEqual(payload, [
    { type: "text", text: "看图：" },
    { type: "image", path: pngPath, alt: "chart" }
  ]);
});
