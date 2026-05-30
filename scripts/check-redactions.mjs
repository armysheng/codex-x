#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const blocked = [
  /\/Users\/armysheng/i,
  /api\.iaigc\.fun/i,
  /router\.iaigc/i,
  new RegExp(["new", "api", "root"].join("-"), "i")
];
const ignoredDirs = new Set(["node_modules", ".git", "dist", "coverage", "tmp"]);
const ignoredFiles = new Set(["scripts/check-redactions.mjs"]);
const exts = new Set([".md", ".json", ".mjs", ".js", ".txt", ".yml", ".yaml", ".env", ".example"]);
const hits = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const rel = path.relative(root, full);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (!ignoredDirs.has(entry)) walk(full);
      continue;
    }
    if (ignoredFiles.has(rel)) continue;
    const ext = path.extname(entry);
    if (!exts.has(ext) && !entry.endsWith(".env.example")) continue;
    const text = readFileSync(full, "utf8");
    for (const rule of blocked) {
      if (rule.test(text)) hits.push(`${rel}: ${rule}`);
    }
  }
}

walk(root);

if (hits.length > 0) {
  console.error("Found blocked strings:");
  for (const hit of hits) console.error(`- ${hit}`);
  process.exit(1);
}

console.log("No blocked strings found.");
