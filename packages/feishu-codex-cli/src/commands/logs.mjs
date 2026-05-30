import { readRuntimeLog } from "../bridge.mjs";

export function runLogsCommand(options = {}) {
  const cwd = options.cwd || process.cwd();
  return readRuntimeLog(cwd) || "No bridge logs found.";
}
