#!/usr/bin/env node

import { main as createWorkspace } from "../packages/create-codex-x/src/index.mjs";

const argv = process.argv.slice(2);
const [command = "help", ...rest] = argv;

if (command === "init") {
  createWorkspace(rest).catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
} else if (command === "help" || command === "--help" || command === "-h") {
  process.stdout.write(
    [
      "Usage:",
      "  codex-x init [--yes] [--answers file.json] <target-dir>",
      "",
      "Examples:",
      "  codex-x init my-workspace",
      "  codex-x init --answers examples/bootstrap.answers.example.json ./tmp/my-workspace"
    ].join("\n") + "\n"
  );
} else {
  console.error(`Unknown command: ${command}`);
  process.exit(1);
}
