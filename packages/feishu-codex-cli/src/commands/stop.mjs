import { appendRuntimeLog, readRuntimeState, writeRuntimeState } from "../bridge.mjs";

export function runStopCommand(options = {}) {
  const cwd = options.cwd || process.cwd();
  const state = readRuntimeState(cwd);
  if (!state?.pid) {
    return "No running bridge process found.";
  }
  const killImpl = options.killImpl || process.kill;
  killImpl(state.pid, "SIGTERM");
  const next = {
    ...state,
    status: "stopped",
    stoppedAt: new Date().toISOString(),
    pid: null
  };
  writeRuntimeState(cwd, next);
  appendRuntimeLog(cwd, "bridge process stopped");
  return `Bridge process stopped\n${JSON.stringify(next, null, 2)}`;
}
