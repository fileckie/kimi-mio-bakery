import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = "/Users/leckie/kimi2.6/kimi-mio-bakery";
const SRC_DIRS = ["src", "server"];

const skipPatterns = [
  /className=/,
  /bg-[-\w\/]+/,
  /text-[-\w\/]+/,
  /border-[-\w\/]+/,
  /#[0-9A-Fa-f]{3,8}/,
  /http/,
  /\.\w{2,6}$/,
  /^[a-z][a-zA-Z0-9-]*$/,
  /^[a-z][a-zA-Z0-9-]* \w+ \w+/,
  /^\d+(px|rem|em|%|vh|vw|svh)$/,
  /^[A-Z][a-z]+[A-Z]/,
];

function isCopy(str) {
  if (!/[\u4e00-\u9fff]/.test(str)) return false;
  for (const p of skipPatterns) if (p.test(str)) return false;
  return true;
}

function extractStrings(content) {
  const results = new Set();
  // Match double-quoted strings
  const dq = content.matchAll(/"((?:[^"\\]|\\.)*?[\u4e00-\u9fff](?:[^"\\]|\\.)*?)"/g);
  for (const m of dq) if (isCopy(m[1])) results.add(m[1]);
  // Match single-quoted strings
  const sq = content.matchAll(/'((?:[^'\\]|\\.)*?[\u4e00-\u9fff](?:[^'\\]|\\.)*?)'/g);
  for (const m of sq) if (isCopy(m[1])) results.add(m[1]);
  // Match template literal strings
  const tl = content.matchAll(/`((?:[^`\\]|\\.)*?[\u4e00-\u9fff](?:[^`\\]|\\.)*?)`/g);
  for (const m of tl) if (isCopy(m[1].replace(/\$\{[^}]*\}/g, "..."))) results.add(m[1]);
  return [...results];
}

function walk(dir, files = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, files);
    else if (/\.(tsx?|mjs)$/.test(f)) files.push(p);
  }
  return files;
}

const sections = {};
for (const srcDir of SRC_DIRS) {
  const dir = join(ROOT, srcDir);
  for (const file of walk(dir)) {
    const rel = relative(ROOT, file);
    const content = readFileSync(file, "utf-8");
    const strings = extractStrings(content);
    if (strings.length) sections[rel] = strings;
  }
}

let md = `# Mio SLOWFIRE — 品牌文案全量物料\n\n> 自动提取自代码仓库，包含所有面向用户的文字表达。\n> 生成时间：${new Date().toLocaleString("zh-CN")}\n\n`;

for (const [file, strings] of Object.entries(sections).sort()) {
  md += `## ${file}\n\n`;
  for (const s of strings) {
    md += `- ${s}\n`;
  }
  md += "\n";
}

writeFileSync(join(ROOT, "COPY.md"), md);
console.log(`Extracted ${Object.values(sections).reduce((a, b) => a + b.length, 0)} strings from ${Object.keys(sections).length} files.`);
