import { mkdirSync } from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";
import { applyBootstrap, readAnswersFile } from "./bootstrap.mjs";
import { normalizeAnswers } from "./questions.mjs";
import { copyTemplate, replaceProjectName } from "./render-template.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");
const TEMPLATE_DIR = path.join(REPO_ROOT, "packages", "workspace-template");

export async function main(argv = []) {
  const options = parseArgs(argv);
  const answers = normalizeAnswers(
    options.answersFile ? readAnswersFile(options.answersFile) : await collectAnswers(options)
  );
  const targetDir = path.resolve(process.cwd(), options.targetDir);
  mkdirSync(path.dirname(targetDir), { recursive: true });
  copyTemplate(TEMPLATE_DIR, targetDir);
  replaceProjectName(targetDir);
  applyBootstrap(targetDir, answers);
  console.log(`Initialized codex-x workspace at ${targetDir}`);
}

function parseArgs(argv) {
  const options = { yes: false, answersFile: "", targetDir: "" };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--yes") options.yes = true;
    else if (arg === "--answers") options.answersFile = argv[i + 1], i += 1;
    else if (!options.targetDir) options.targetDir = arg;
  }
  if (!options.targetDir) {
    throw new Error("Usage: create-codex-x [--yes] [--answers file.json] <target-dir>");
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
    return {
      ownerName,
      assistantName,
      language,
      confirmationBoundaries: confirmation
        .split(/[、,，]/)
        .map((item) => item.trim())
        .filter(Boolean)
    };
  } finally {
    rl.close();
  }
}
