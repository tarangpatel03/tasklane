#!/usr/bin/env node
/**
 * PostToolUse hook for Edit | Write | MultiEdit.
 *
 * Runs ESLint --fix, then Prettier --write, on the single file Claude just edited.
 * Lint errors that ESLint cannot auto-fix are sent back to Claude (stderr + exit 2)
 * so it fixes the real cause instead of disabling the rule.
 *
 * It never blocks work because of its own problems: unsupported file types, missing
 * ESLint/Prettier, missing config or an unexpected crash all exit 0 silently.
 * Run `claude --debug` to see hook activity.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const LINT_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const FORMAT_EXT = new Set([
  ...LINT_EXT,
  '.json',
  '.css',
  '.scss',
  '.html',
  '.md',
  '.yml',
  '.yaml',
]);
const ESLINT_CONFIGS = [
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  'eslint.config.ts',
  '.eslintrc',
  '.eslintrc.js',
  '.eslintrc.cjs',
  '.eslintrc.json',
  '.eslintrc.yml',
  '.eslintrc.yaml',
];
const MAX_REPORT_LINES = 30;

/** Walk up from startDir; return the first truthy value test(dir) gives, or null. */
function findUp(startDir, test) {
  let dir = startDir;
  for (;;) {
    const hit = test(dir);
    if (hit) return hit;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** Locate a locally installed package's CLI entry file (works with hoisted workspaces). */
function findBin(pkg, startDir) {
  return findUp(startDir, (dir) => {
    const pkgJson = path.join(dir, 'node_modules', pkg, 'package.json');
    if (!fs.existsSync(pkgJson)) return null;
    const meta = JSON.parse(fs.readFileSync(pkgJson, 'utf8'));
    const rel = typeof meta.bin === 'string' ? meta.bin : meta.bin && meta.bin[pkg];
    return rel ? path.join(path.dirname(pkgJson), rel) : null;
  });
}

function run(bin, args, cwd) {
  return spawnSync(process.execPath, [bin, ...args], { cwd, encoding: 'utf8' });
}

function trim(text) {
  const lines = text.split('\n');
  if (lines.length <= MAX_REPORT_LINES) return text;
  return `${lines.slice(0, MAX_REPORT_LINES).join('\n')}\n... (${lines.length - MAX_REPORT_LINES} more lines)`;
}

function main(input) {
  const file = input && input.tool_input && input.tool_input.file_path;
  if (!file || !fs.existsSync(file)) return 0;

  const ext = path.extname(file).toLowerCase();
  if (!FORMAT_EXT.has(ext)) return 0;

  const fileDir = path.dirname(path.resolve(file));
  const problems = [];

  if (LINT_EXT.has(ext)) {
    const configDir = findUp(fileDir, (dir) =>
      ESLINT_CONFIGS.some((name) => fs.existsSync(path.join(dir, name))) ? dir : null,
    );
    const eslintBin = findBin('eslint', fileDir);
    if (configDir && eslintBin) {
      const res = run(eslintBin, ['--fix', file], configDir);
      // Exit 1 = lint errors remain after auto-fix. Other codes (config/crash) are ignored.
      if (res.status === 1) {
        problems.push(
          `ESLint errors in ${path.relative(process.cwd(), file) || file} ` +
            '(auto-fixable ones are already fixed). Fix the cause in code; do not disable rules:\n' +
            trim(`${res.stdout}${res.stderr}`.trim()),
        );
      }
    }
  }

  const prettierBin = findBin('prettier', fileDir);
  if (prettierBin) {
    const res = run(prettierBin, ['--write', file], fileDir);
    if (res.status !== 0) {
      problems.push(
        `Prettier could not format ${file} (likely a syntax error):\n${trim(res.stderr.trim())}`,
      );
    }
  }

  if (problems.length === 0) return 0;
  process.stderr.write(`${problems.join('\n\n')}\n`);
  return 2;
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  raw += chunk;
});
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exitCode = 0;
    return;
  }
  try {
    process.exitCode = main(input);
  } catch {
    process.exitCode = 0;
  }
});
