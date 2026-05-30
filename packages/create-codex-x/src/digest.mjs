import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export function runDigest(options = {}) {
  const cwd = options.cwd || process.cwd();
  const today = options.today || new Date().toISOString().slice(0, 10);
  const yesterday = previousDay(today);
  const memoryDir = path.join(cwd, "0-System", "memory");
  const todayPath = path.join(memoryDir, `${today}.md`);
  const yesterdayPath = path.join(memoryDir, `${yesterday}.md`);

  const sections = [];
  if (existsSync(yesterdayPath)) {
    sections.push(formatDigestSection(yesterday, readFileSync(yesterdayPath, "utf8")));
  }
  if (existsSync(todayPath)) {
    sections.push(formatDigestSection(today, readFileSync(todayPath, "utf8")));
  }

  const digest = [
    `# Digest ${today}`,
    "",
    ...sections
  ].join("\n");

  if (options.writeStatus) {
    writeFileSync(
      path.join(cwd, "0-System", "status.md"),
      [
        "# Status",
        "",
        "- 当前阶段：最近 48 小时摘要已整理。",
        ...collectBullets(sections).slice(0, 4).map((line) => `- ${line}`)
      ].join("\n")
    );
  }

  if (options.writeContext) {
    writeFileSync(
      path.join(cwd, "0-System", "context.md"),
      [
        "# Context",
        "",
        ...sections
      ].join("\n")
    );
  }

  return digest;
}

function previousDay(dateStr) {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function formatDigestSection(date, source) {
  const lines = source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const bullets = lines.filter((line) => line.startsWith("- "));
  return [
    `## ${date}`,
    ...bullets
  ].join("\n");
}

function collectBullets(sections) {
  return sections
    .flatMap((section) => section.split(/\r?\n/))
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2));
}
