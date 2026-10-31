# Claude Code starter pack

Project-local setup. Nothing here touches `~/.claude`.

## Install

1. Copy everything in this folder into your project root (merge `.claude/` and `docs/` if they exist).
2. Edit the `Stack:` line in `CLAUDE.md`.
3. Add to `.gitignore`:
   ```
   .claude/settings.local.json
   .claude/tmp/
   ```
4. Make sure the project has ESLint and Prettier configured and installed locally (`yarn add -D eslint prettier eslint-config-prettier`).
5. One-time baseline: run `yarn prettier --write .` and commit it alone, so Claude's edits never trigger whole-file reformatting noise in diffs.
6. Start `claude` in the project root, run `/hooks` and confirm the PostToolUse hook is listed.
7. Run `/config`, open Output style, and pick **Terse**. If CLAUDE.md alone already keeps replies short, you can delete `.claude/output-styles/terse.md`.
8. Fill in `docs/design-brief.md` before the first UI task.

## What each file does

| File | Purpose |
|---|---|
| `CLAUDE.md` | Always-loaded rules: one-line reports, checkpoints, minimal diffs, TypeScript rules, "formatting is not your job". Kept short on purpose. |
| `.claude/settings.json` | Blocks edits to ESLint/Prettier configs and reading `.env`; runs the format/lint hook after every edit. |
| `.claude/hooks/format-lint.js` | Runs `eslint --fix` then `prettier --write` on the edited file. Remaining lint errors go back to Claude. |
| `.claude/output-styles/terse.md` | Reinforces one-line status replies at system-prompt level. |
| `.claude/skills/ui-design-quality/` | Brief-first design process, tokens, color/type rules, anti-"AI look" checklist. Loaded only for UI work. |
| `.claude/skills/rn-responsive-ui/` | React Native: insets, window size classes, list-detail split, foldables, device screenshots. |
| `.claude/skills/web-responsive-motion/` | Web: fluid layout, animation rules, accessibility, verification. |
| `.claude/skills/nest-backend/` | NestJS + PostgreSQL + TypeORM: feature-module structure, guards/pipes, DTOs, response envelope, migrations. Loaded only for backend work. |
| `docs/design-brief.md` | Per-project design direction you fill in. |

## Modes and models

- Plan mode (Shift+Tab) for planning and decisions, Manual mode to execute one checkpoint at a time.
- Default model Sonnet 5.5 (`/model`). Use Opus 5.5 only for hard architecture or bugs Sonnet failed twice.
- Safe commands (lint, tsc, git diff/status/log, adb) are pre-approved in `.claude/settings.json`.

## Troubleshooting

- Hook not running: `claude --debug`, check `/hooks`, and confirm `node` is on PATH.
- Hook silent on a file: it skips unsupported types and projects where ESLint/Prettier or an ESLint config cannot be found.
- Skills not appearing: restart `claude`; run `/context` to see what is loaded.
