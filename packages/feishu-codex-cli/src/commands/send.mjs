import { planFeishuReplies } from "../message-format.mjs";

export function runSendCommand(args = [], options = {}) {
  const cwd = options.cwd || process.cwd();
  const text = args.join(" ").trim();
  if (!text) {
    throw new Error("Usage: feishu-codex send <text>");
  }
  const plan = planFeishuReplies(text, { cwd });
  return JSON.stringify(plan, null, 2);
}
