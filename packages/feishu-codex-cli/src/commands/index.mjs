import { runDoctorCommand } from "./doctor.mjs";
import { runInitCommand } from "./init.mjs";
import { runLogsCommand } from "./logs.mjs";
import { runSendCommand } from "./send.mjs";
import { runSmokeCommand } from "./smoke.mjs";
import { runStartCommand } from "./start.mjs";
import { runStatusCommand } from "./status.mjs";
import { runStopCommand } from "./stop.mjs";

export async function main(argv = [], io = console) {
  const [command = "init", subcommand, ...rest] = argv;
  if (command === "init") {
    io.log(
      runInitCommand({
        cwd: process.cwd(),
        printExample: rest.includes("--print-example") || subcommand === "--print-example",
        writeConfig: rest.includes("--write-config") || subcommand === "--write-config"
      })
    );
    return;
  }
  if (command === "bridge" && subcommand === "start") {
    io.log(
      runStartCommand({
        cwd: io.cwd || process.cwd(),
        env: io.env || process.env,
        spawnImpl: io.spawnImpl,
        spawnRuntime: true
      })
    );
    return;
  }
  if (command === "bridge" && subcommand === "status") {
    io.log(runStatusCommand({ cwd: process.cwd() }));
    return;
  }
  if (command === "bridge" && subcommand === "logs") {
    io.log(runLogsCommand({ cwd: process.cwd() }));
    return;
  }
  if (command === "bridge" && subcommand === "stop") {
    io.log(runStopCommand({ cwd: io.cwd || process.cwd(), killImpl: io.killImpl }));
    return;
  }
  if (command === "bridge" && subcommand === "smoke") {
    io.log(runSmokeCommand({ cwd: io.cwd || process.cwd(), env: io.env || process.env, runImpl: io.runImpl }));
    return;
  }
  if (command === "send") {
    io.log(runSendCommand([subcommand, ...rest].filter(Boolean), { cwd: process.cwd() }));
    return;
  }
  if (command === "doctor") {
    io.log(
      runDoctorCommand({
        cwd: io.cwd || process.cwd(),
        env: io.env || process.env,
        commandExists: io.commandExists
      })
    );
    return;
  }
  throw new Error("Usage: feishu-codex <init|bridge start|bridge status|bridge logs|bridge stop|bridge smoke|send|doctor>");
}
