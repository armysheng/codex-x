import { mkdirSync } from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";
import { applyBootstrap, readAnswersFile } from "./bootstrap.mjs";
import { registerCodexMemoryDigestAutomation } from "./codex-automation.mjs";
import { runDigest } from "./digest.mjs";
import { normalizeAnswers } from "./questions.mjs";
import { copyTemplate, replaceProjectName } from "./render-template.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");
const TEMPLATE_DIR = path.join(REPO_ROOT, "packages", "workspace-template");

export async function main(argv = [], deps = {}) {
  const [command] = argv;
  if (command === "digest") {
    const digestOptions = parseDigestArgs(argv.slice(1));
    const output = runDigest({
      cwd: path.resolve(process.cwd(), digestOptions.targetDir || "."),
      today: digestOptions.today,
      writeStatus: digestOptions.writeStatus,
      writeContext: digestOptions.writeContext
    });
    console.log(output);
    return;
  }
  if (command === "automation") {
    const automationOptions = parseAutomationArgs(argv.slice(1));
    const result = registerCodexMemoryDigestAutomation({
      workspaceDir: path.resolve(process.cwd(), automationOptions.targetDir),
      codexHome: deps.codexHome,
      repoRoot: deps.repoRoot || REPO_ROOT,
      nowMs: deps.nowMs
    });
    console.log(`Registered Codex automation: ${result.path}`);
    return;
  }
  const options = parseArgs(argv);
  const rawAnswers = options.answersFile ? readAnswersFile(options.answersFile) : await collectAnswers(options);
  const answers = normalizeAnswers(rawAnswers);
  const registerCodexAutomation = resolveCodexAutomationSetting(options, rawAnswers);
  const targetDir = path.resolve(process.cwd(), options.targetDir);
  mkdirSync(path.dirname(targetDir), { recursive: true });
  copyTemplate(TEMPLATE_DIR, targetDir);
  replaceProjectName(targetDir);
  const result = applyBootstrap(targetDir, answers, new Date(), {
    codexHome: deps.codexHome,
    repoRoot: deps.repoRoot || REPO_ROOT,
    nowMs: deps.nowMs,
    registerCodexAutomation
  });
  console.log(`Initialized codex-x workspace at ${targetDir}`);
  if (result.codexAutomation) {
    console.log(`Registered Codex automation: ${result.codexAutomation.path}`);
  }
}

function parseArgs(argv) {
  const options = { yes: false, answersFile: "", targetDir: "", registerCodexAutomation: undefined };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--yes") options.yes = true;
    else if (arg === "--answers") options.answersFile = argv[i + 1], i += 1;
    else if (arg === "--no-automation") options.registerCodexAutomation = false;
    else if (arg === "--codex-automation") options.registerCodexAutomation = true;
    else if (!options.targetDir) options.targetDir = arg;
  }
  if (!options.targetDir) {
    throw new Error("Usage: create-codex-x [--yes] [--answers file.json] [--no-automation] <target-dir>");
  }
  return options;
}

function resolveCodexAutomationSetting(options, rawAnswers) {
  if (typeof options.registerCodexAutomation === "boolean") {
    return options.registerCodexAutomation;
  }
  if (typeof rawAnswers.registerCodexAutomation === "boolean") {
    return rawAnswers.registerCodexAutomation;
  }
  return true;
}

function parseAutomationArgs(argv) {
  const [subcommand, targetDir = "."] = argv;
  if (subcommand !== "install") {
    throw new Error("Usage: create-codex-x automation install [target-dir]");
  }
  return { targetDir };
}

function parseDigestArgs(argv) {
  const options = { targetDir: ".", today: "", writeStatus: false, writeContext: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--today") options.today = argv[i + 1], i += 1;
    else if (arg === "--write-status") options.writeStatus = true;
    else if (arg === "--write-context") options.writeContext = true;
    else if (!arg.startsWith("--")) options.targetDir = arg;
  }
  return options;
}

async function collectAnswers(options) {
  if (options.yes) return {};
  const rl = readline.createInterface({ input, output });
  try {
    const ownerName = await rl.question("你希望我怎么称呼你？ ");
    const assistantName = await rl.question("我应该叫什么名字？ ");
    const language = await rl.question("默认用什么语言？ ");
    const confirmation = await rl.question("哪些动作必须先征得你确认？（用顿号分隔） ");
    const automation = await rl.question("是否注册 Codex 每日记忆整理 automation？[Y/n] ");
    return {
      ownerName,
      assistantName,
      language,
      registerCodexAutomation: !/^n(o)?$/i.test(automation.trim()),
      confirmationBoundaries: confirmation
        .split(/[、,，]/)
        .map((item) => item.trim())
        .filter(Boolean)
    };
  } finally {
    rl.close();
  }
}
