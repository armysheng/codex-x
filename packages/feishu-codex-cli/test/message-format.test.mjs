import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  createCodexInputText,
  parseFeishuContent,
  planFeishuReplies
} from "../src/message-format.mjs";

const fixtureDir = join(tmpdir(), "codex-x-feishu-message-format-test");
mkdirSync(fixtureDir, { recursive: true });
const pngPath = join(fixtureDir, "chart.png");
const pdfPath = join(fixtureDir, "report.pdf");
writeFileSync(pngPath, "png");
writeFileSync(pdfPath, "pdf");

test("plans local markdown images as image replies", () => {
  const plan = planFeishuReplies(`看这张图：\n![chart](${pngPath})\n结论在上面。`, { cwd: process.cwd() });
  assert.deepEqual(plan, [
    { type: "text", text: "看这张图：" },
    { type: "image", path: pngPath, alt: "chart" },
    { type: "text", text: "结论在上面。" }
  ]);
});

test("plans local markdown links to non-images as file replies", () => {
  const plan = planFeishuReplies(`报告在这里：[report](${pdfPath})`, { cwd: process.cwd() });
  assert.deepEqual(plan, [
    { type: "text", text: "报告在这里：" },
    { type: "file", path: pdfPath, title: "report" }
  ]);
});

test("parses attachments and creates Codex input text", () => {
  assert.equal(parseFeishuContent("text", "{\"text\":\"你好\"}").text, "你好");
  assert.deepEqual(parseFeishuContent("image", "{\"image_key\":\"img_123\"}").attachments, [
    { type: "image", fileKey: "img_123" }
  ]);

  const prompt = createCodexInputText({
    text: "帮我看一下",
    attachments: [
      { type: "image", path: pngPath, name: "chart.png" },
      { type: "file", path: pdfPath, name: "report.pdf" }
    ]
  });

  assert.match(prompt, /帮我看一下/);
  assert.match(prompt, /!\[chart\.png\]\(/);
  assert.match(prompt, /用户上传了文件：report\.pdf/);
});
