import { readRuntimeState } from "../bridge.mjs";

function defaultIsProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function runStatusCommand(options = {}) {
  const cwd = options.cwd || process.cwd();
  const state = readRuntimeState(cwd);
  if (!state) return "No bridge runtime state found.";
  const isProcessAlive = options.isProcessAlive || defaultIsProcessAlive;
  let next = state;
  if (state.pid) {
    next = {
      ...state,
      status: isProcessAlive(state.pid) ? "running" : "stale"
    };
  }
  return JSON.stringify(next, null, 2);
}
