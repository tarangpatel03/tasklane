# Project rules

Stack:

- Language: TypeScript (strict)
- Framework: React Native CLI(Mobile App), React(Admin Dashboard)
- Backend: NestJS
- DB: PostgreSQL (TypeORM)
- Package manager: yarn

## Reporting (keep output tiny)

- Read docs/project-spec.md before any feature work.
- After finishing a task, reply with ONE short line, e.g. `Login issue fixed. Please review.`
- No code blocks, diffs, file lists, recaps or explanations unless I ask ("explain", "details", "why").
- Exception: add ONE extra line only if you changed something outside the request, skipped a check, or found a risk I must know about.
- Blocked or need a decision: ask ONE short question.
- Don't narrate between tool calls. Don't echo code back.

## Multi-step goals (checkpoints)

- Break the goal into numbered checkpoints (1.1, 1.2, ...) and show the list first. Wait for my OK.
- After each checkpoint, stop and reply exactly: `Checkpoint 1.3 done. Proceed to 1.4 (<name>)?`
- Do not start the next checkpoint until I say yes. Do not commit unless I ask.

## Code changes

- File names: screens and components are PascalCase; everything else is camelCase with a role suffix (`.service.ts`, `.types.ts`, `.api.ts`, `.util.ts`). Group files of similar purpose into a purpose-named subfolder (e.g. `components/buttons/`); a file with no peers stays flat. Details in docs/project-spec.md, section 2.
- React and React Native code (components, hooks, handlers, helpers) uses arrow functions (`export const Foo = (): ReactNode => {}`), not `function` declarations. Existing code is not converted unless asked.
- Never hardcode route names, API paths or query keys. Use the central constants (see docs/project-spec.md, section 2) and add new ones there first.
- Make the smallest change that solves the task. No refactors, renames, reordering or cleanup I didn't ask for.
- No new dependencies, abstractions or config for hypothetical needs. Ask before adding any dependency.
- Match the patterns already used in the file/folder.
- If the request is ambiguous, ask before coding.
- TypeScript: no `any` (use `unknown` and narrow). No `!` non-null assertions or `as` casts without a one-line reason. Explicit return types on exported functions.
- Comments explain why, not what. Exported functions/classes get short JSDoc.
- When setup, env vars or behavior change, update the nearest README in the same change.
- Before using a library API you are unsure about, check current docs (Context7 if available) instead of guessing.
- Ask before changing tsconfig.
- Do not create test files, add tests, or run extra review passes unless I ask.

## Formatting is not your job

- Write code naturally. Never hand-format (quotes, commas, wrapping, import order, whitespace).
- A hook runs ESLint --fix and Prettier on every file you edit. If it reports errors, fix the cause in the code.
- Never add `eslint-disable`, `@ts-ignore`, `@ts-expect-error` or `prettier-ignore`.
- Never edit ESLint or Prettier config files. Ask me.

## UI work

- Before any UI work, load the matching skills: `ui-design-quality` (always), plus `rn-responsive-ui` (mobile) or `web-responsive-motion` (web).
- Read `docs/design-brief.md` first. If it is empty or missing, ask me for it. Do not invent a visual style.
- `docs/design-brief.md` overrides any style defaults from skills or plugins.
- Use the Chrome DevTools MCP (web) or adb screenshots (mobile) to check the result before reporting done.

## Backend work (NestJS)

- Before any backend work, load the `nest-backend` skill: feature-module folders, guards and pipes by default, one response envelope, migrations only.

## Checkpoint workflow

- "Plan checkpoint X.Y": read docs/project-spec.md and any skill relevant to the work. Plan only that checkpoint. List manual steps I must do (database setup, deleting generated Prettier configs, and so on). Show the plan and wait for my approval.
- "Proceed with checkpoint X.Y": follow the plan I approved in this conversation. If there is no approved plan, say so and stop. Do only that checkpoint, then reply with the checkpoint line.
