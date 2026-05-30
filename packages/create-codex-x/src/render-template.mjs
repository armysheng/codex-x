import { cpSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const TEXT_EXTENSIONS = new Set([".md", ".json", ".txt", ".yml", ".yaml"]);

export function copyTemplate(templateDir, targetDir) {
  mkdirSync(path.dirname(targetDir), { recursive: true });
  cpSync(templateDir, targetDir, { recursive: true });
}

export function replaceProjectName(rootDir) {
  walk(rootDir, (filePath) => {
    const ext = path.extname(filePath);
    if (!TEXT_EXTENSIONS.has(ext)) return;
    const source = readFileSync(filePath, "utf8");
    const next = source
      .replaceAll("codex-assistant-template", "codex-x")
      .replaceAll("codex-assistant", "codex-x");
    if (next !== source) writeFileSync(filePath, next);
  });
}

function walk(dir, visitor) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, visitor);
      continue;
    }
    visitor(full);
  }
}
