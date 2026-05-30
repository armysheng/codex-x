import { main as createWorkspace } from "../packages/create-codex-x/src/index.mjs";
import { main as feishuMain } from "../packages/feishu-codex-cli/src/commands/index.mjs";

export async function runRootCli(argv = [], deps = {}) {
  const createMain = deps.createMain || createWorkspace;
  const feishu = deps.feishuMain || feishuMain;
  const [command = "help", ...rest] = argv;

  if (command === "init") {
    await createMain(rest);
    return;
  }

  if (command === "digest") {
    await createMain(["digest", ...rest]);
    return;
  }

  if (command === "automation") {
    await createMain(["automation", ...rest]);
    return;
  }

  if (command === "doctor") {
    await feishu(["doctor"], deps.io || console);
    return;
  }

  if (command === "bridge") {
    await feishu(["bridge", ...rest], deps.io || console);
    return;
  }

  if (command === "send") {
    await feishu(["send", ...rest], deps.io || console);
    return;
  }

  if (command === "help" || command === "--help" || command === "-h") {
    process.stdout.write(
      [
        "Usage:",
        "  codex-x init [--yes] [--answers file.json] [--no-automation] <target-dir>",
        "  codex-x automation install [target-dir]",
        "  codex-x digest [target-dir] [--today YYYY-MM-DD] [--write-status] [--write-context]",
        "  codex-x doctor",
        "  codex-x bridge <start|status|logs|stop|smoke>",
        "  codex-x send <text>",
        "",
        "Examples:",
        "  codex-x init my-workspace",
        "  codex-x automation install ./my-workspace",
        "  codex-x digest ./my-workspace --write-status --write-context",
        "  codex-x doctor",
        "  codex-x bridge smoke"
      ].join("\n") + "\n"
    );
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}
