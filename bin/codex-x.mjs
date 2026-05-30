#!/usr/bin/env node

import { runRootCli } from "./root-cli.mjs";

runRootCli(process.argv.slice(2)).catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
