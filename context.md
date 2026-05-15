# Hermes Soul Studio — Context for AI Assistants

## What this project is

Hermes Soul Studio is a local-first web app that generates a structured AI operator setup.

The product helps a user define an AI assistant/operator with:

- Identity and tone
- Roles
- Workspaces / brains
- Skill maps
- Approval gates
- External tool routing
- Export targets
- Test prompts
- Local backup scripts

The generated output is a downloadable `.agent/` folder that can be adapted for Hermes, Claude, Codex, Cursor, ChatGPT Custom Instructions, or another local agent runtime.

The core idea:

```txt
One messy chatbot → structured AI operator
```

The operator should know:

```txt
Who it serves
What workspaces it handles
Which skills to use
Which tools to hand off to
What it must never do without approval
How to recover, test, and back up its setup
```

---

## Product positioning

Name:

```txt
Hermes Soul Studio
```

Tagline:

```txt
Teach your AI how you actually work.
```

Short product description:

```txt
A guided 5-step generator that turns any AI assistant (Claude, Codex, Cursor, ChatGPT) into a structured operator with brains, skills, approval gates, external handoffs, exports, and backups. Everything runs in the browser.
```

This project should feel like a guided setup, not a generic form builder.

---

## Target users

Field-agnostic. Potential users:

- Founders
- Designers
- Developers
- Students
- Teachers
- Creators
- Consultants
- Researchers
- Agencies
- Operators
- Freelancers

The system works across fields because the architecture is generic:

```txt
Core Brain
→ Workspace Router
→ Workspace Brains
→ Skill Maps
→ Execution Handoff
→ External Skill Router
→ Export / Backup / Test
```

The field-specific part comes from user input:

```txt
Roles
Workspaces
Common tasks
Approval boundaries
External tools
Export targets
```

---

## Current app behavior

The app is structured as an **intro screen + 5-step guided wizard + review screen**.

### Intro

Shown on first visit (dismissal stored in `localStorage` as `introSeen`). Includes:

- Headline + plain-English pitch (no jargon)
- "Get started" CTA and a "View on GitHub" link
- 3 value cards (Tell us about your work / Set safe defaults / Download & paste)
- "Run it locally" panel with `git clone` instructions for cloning into `~/.hermes` and a note that dot-folders are hidden on macOS/Linux (with view-toggle instructions)

Clicking the Hermes logo in the top bar at any time returns to the intro.

### Steps

The wizard shows **one step at a time**, with a horizontal step indicator placed in its own bar **below the top bar** (not inside the header). Each step has Back / Next buttons; the final step has a Download button.

1. **About you** — name, AI name, company, profile name, roles (chip input), tone, what to avoid.
2. **Your work** — workspaces shown as tabs; for each tab the user edits one workspace inline. Purpose / Common tasks / Approvals are **checkbox groups** (not free-text), driven by the workspace **name slug** (a library of 10 workspace types + a custom fallback). Risk is a 3-option radio (Low / Medium / High). Every checkbox group has an "Add your own…" input that appends custom tags; pre-existing custom values are preserved as removable purple pills.
3. **Other tools** — toggles for Codex, Claude, Google Drive, Telegram, Notion, GitHub.
4. **Where to use it** — export targets (Hermes, Codex, Claude, Cursor, ChatGPT).
5. **Backup** — toggle hourly local backup script + retention count.
6. **Review & download** — file count, ZIP download (with macOS hidden-folder hint), validation warnings, behavior preview, brain map, expandable test prompts / file tree / SOUL.md preview.

### Theme

- Light / dark / system theme. A no-flash inline script in `app/layout.jsx` sets `dark` on `<html>` before paint based on `localStorage.theme` (if set) or `prefers-color-scheme`.
- A Sun/Moon toggle in the top bar lets the user override the system preference. The choice is persisted to `localStorage.theme`.
- Tailwind is configured with `darkMode: 'class'`. All components have `dark:` variants.
- `app/layout.jsx` declares a `viewport.themeColor` array for light + dark schemes.

### Right-side summary

A compact sticky panel shows progress %, workspace count, tools on, exports on, files-to-make, and a "Download now" shortcut on every non-review step.

### Top bar

- Hermes logo (clickable — returns to intro)
- Share-link button (copies a `#c=` hash-encoded URL of the current config)
- GitHub link → <https://github.com/krigrv/hermes-soul-studio>
- Theme toggle (Sun / Moon)

### Removed / dropped features

- The earlier preset-template picker has been removed.
- The earlier JSON import / export buttons have been removed.
- The earlier all-in-one long-scroll form has been replaced by the wizard.

The app remains local-first. Generation happens in the browser using JSZip.

---

## Key UX principle

The design approach follows Don Norman-style usability principles.

### Visibility

Users should always see what is being created.

Current visibility features:

- Live `SOUL.md` preview (on review step, behind a `<details>`)
- Brain map (on review step)
- Generated file tree (on review step)
- File count, workspace count, tool count, export count in the sticky summary
- Behavior preview that classifies an example task

### Feedback

Every action should visibly affect the generated system.

Current feedback features:

- Sticky summary updates live (score %, workspace count, etc.)
- Brain map updates
- File tree updates
- Role chips update
- Tool/export selection states update
- Test prompts change with workspaces
- "Downloaded" confirmation flashes on the download button

### Constraints

The UI should prevent unsafe AI operator behavior.

Current constraints:

- Approval rules per workspace (checkbox set tuned per workspace type)
- Risk radio (Low / Medium / High) with plain-English descriptions
- External action boundaries
- Backup exclusions for secrets/tokens
- Codex/Claude handoff separation

### Mapping

The UI should make it obvious what each input controls.

Mapping model:

```txt
Roles → operator identity defaults
Workspaces → what the operator can handle
Tools → what external engines it can use
Exports → where setup can be used
Approval rules → what it cannot do alone
```

### Recovery

Users should be able to test and recover.

Current recovery features:

- Undo for deleted workspaces (6-second toast)
- Test prompt generator
- Download ZIP
- Backup script generation
- Local-first browser generation
- Share link encodes the whole config in the URL hash

---

## Generated folder structure

The app generates a structure like:

```txt
.agent/
├── SOUL.md
├── active_profile
├── profiles/
│   └── default/
│       ├── SOUL.md
│       ├── brains/
│       │   ├── core/
│       │   ├── business/
│       │   ├── coding/
│       │   └── ...
│       ├── skills/
│       │   ├── workspace-router/
│       │   ├── execution-handoff/
│       │   ├── external-skill-router/
│       │   ├── codex-handoff/
│       │   ├── claude-handoff/
│       │   └── prioritization-framework/
│       └── system/
│           ├── execution-log.md
│           └── test-prompts.md
├── skills/
└── scripts/
    └── hourly-agent-backup.sh
```

It may also generate:

```txt
exports/
├── .cursor/rules.md
├── chatgpt-custom-instructions.txt
├── codex/SKILL.md
└── claude/SKILL.md
```

Note: on macOS/Linux, the `.agent/` folder is hidden by default in file browsers because the name starts with a dot. The review screen reminds the user to press `Cmd ⇧ .` in Finder to reveal it.

---

## File-count math (for sanity checks)

For a config with N workspaces and all exports/tools enabled:

```
1  active_profile
2  .agent/SOUL.md  +  .agent/profiles/{profile}/SOUL.md
N×4  per-workspace brain files (SOUL, rules, agents, skill-map)
6×2  skills × 2 paths (.agent/skills + .agent/profiles/{profile}/skills)
2  execution-log.md + test-prompts.md
1  hourly-agent-backup.sh
4  exports/.cursor/rules.md + chatgpt-custom-instructions.txt + codex/SKILL.md + claude/SKILL.md
1  README.md
```

So `total = 23 + 4N`. With 6 workspaces → **47 files**.

---

## Setup score (heuristic)

`lib/score.js` averages five sub-scores into the headline %:

- **Identity** — non-empty (>4 chars) of userName / operatorName / roles / tone × 25, capped 100
- **Workspaces** — count × 18 + bonus 20 if ≥4, capped 100
- **Approval Safety** — % of workspaces whose approvals text length is > 15 chars
- **Tool Routing** — toggled-on tools × 18, capped 100
- **Exports** — toggled-on exports × 20, capped 100

This is a "how complete is your setup" hint, not a security audit.

---

## Workspace options library

`lib/workspace-options.js` defines exhaustive Purpose / Tasks / Approvals option sets keyed by workspace slug:

```
core, business, coding, design, education, admin,
academics, creative, finance, research, custom (fallback)
```

When the user renames a workspace, the option set switches to the matching slug. Unknown names use `custom` (a broad union). Pre-existing custom values are preserved as purple "extra" pills with an X-to-remove.

---

## Important generated files

### `SOUL.md`

Defines the operator identity, tone, mission, boundaries, workspace intelligence, classification format, and operating principles.

### Workspace brain files

Each workspace has:

```txt
SOUL.md
rules.md
agents.md
skill-map.md
```

These define what that workspace handles, its approval rules, and suggested agents/skills.

### `workspace-router/SKILL.md`

Classifies tasks before execution.

Expected classification format:

```txt
Workspace:
Brain Path:
Task Type:
Relevant Brain Files:
Matching Skill / Pipeline:
Sub-skills:
Risk Level:
Needs Approval:
Next Step:
```

### `execution-handoff/SKILL.md`

Controls what happens when the user says:

```txt
go
proceed
run it
execute
start
continue
do it
```

It checks permissions before executing.

### `external-skill-router/SKILL.md`

Decides whether the task should stay native or be handed off to Codex, Claude, or another engine.

### `codex-handoff/SKILL.md`

Prepares a safe repo/code handoff for Codex.

### `claude-handoff/SKILL.md`

Prepares a reasoning, critique, writing, or strategy handoff for Claude.

### `prioritization-framework/SKILL.md`

Helps users decide what to focus on first across workspaces.

---

## Current tech stack

```txt
Next.js 16 (app router, turbopack dev)
React 19
Tailwind CSS 3 (darkMode: class)
JSZip 3.10
lucide-react 1.16 (old build — no Github icon; inline SVG is used instead)
```

The project is built as a browser-only generator.

---

## Current source files

```txt
app/
  page.jsx          // wizard, intro, theme toggle, top bar, step bar, all step components
  layout.jsx        // metadata + theme init script
  globals.css       // CSS variables for light/dark body bg
components/
  Field.jsx         // labelled input / textarea with dark: variants
  Section.jsx       // (legacy; no longer used by page.jsx)
  CheckboxGroup.jsx // pill-style multi-select + Add-your-own + RiskRadio
  BrainMap.jsx      // visualisation of router → workspaces
  ValidationPanel.jsx
  BehaviorPreview.jsx
lib/
  workspace-library.js  // pre-baked workspace defaults
  workspace-options.js  // exhaustive option lists per workspace slug
  presets.js            // TOOL_OPTIONS + EXPORT_TARGETS (PRESETS array still exported but unused)
  generators.js         // file generators (SOUL, brains, skills, handoffs, backup script)
  score.js              // setup score heuristic
  validate.js           // validation warnings
  behavior.js           // example task classifier for the BehaviorPreview
  storage.js            // localStorage save/load + share-link hash encode/decode
  utils.js              // slugify, splitList, safe
public/
  favicon.svg, og.svg
README.md
context.md             // this file
package.json, tailwind.config.js, postcss.config.js, next.config.mjs
```

---

## Design direction

Visual style:

- Dark + light modes (system-aware, toggleable)
- Orange accent
- Strong typography
- Rounded cards
- Studio/tool hybrid
- Premium but practical

The product should feel:

```txt
Clear
Powerful
Local-first
Safe
Structured
Useful
Not enterprise-boring
```

Avoid turning it into:

```txt
A generic SaaS dashboard
A long lifeless form
A chatbot wrapper
A prompt marketplace
A login-first product
```

---

## Product rules

### Local-first by default

Do not require login for MVP.

The first version should generate everything in the browser.

### No cloud storage by default

Do not store user data unless a future explicit save/sync feature is added.

### Export-first

The core output is a downloadable setup ZIP.

### Field-agnostic

Avoid hardcoding one user's personal context.

Use placeholders:

```txt
Your Name
Your Company
Your Operator
```

### Approval-first

The generated agent should never be encouraged to send, publish, delete, buy, deploy, submit, or modify production without approval.

---

## Important implementation details

### Role handling

Roles are managed as comma-separated text internally, but the UI presents them as chips.

Users can:

- Add a custom role
- Press Enter to add
- Click a chip to remove it

### Workspace handling

Workspaces can be:

- Added from the workspace library (pills next to the workspace tabs in Step 2)
- Added blank (`+ Blank`)
- Edited
- Removed (with 6-second undo)

Every workspace stores:

```txt
name        // string — also drives which checkbox option set is shown
purpose     // comma-separated list, populated by checkboxes + custom adds
tasks       // comma-separated list
risk        // "Low" | "Medium" | "High"
approvals   // comma-separated list
```

The string-as-comma-list shape is preserved so the existing generator code works unchanged.

### ZIP generation

JSZip creates the downloadable setup in the browser.

The downloaded files are text-based Markdown/setup files.

### Theme persistence

- First paint reads `localStorage.theme` ("dark" / "light"), falling back to `matchMedia('(prefers-color-scheme: dark)')`.
- Toggle button writes the new value to localStorage so it survives reloads.
- All component colors use `dark:` Tailwind variants. No JS-driven color overrides.

### Hidden folder warnings

Two places mention hidden folders:

- **Intro page** — the "Run it locally" panel explains that `~/.hermes` is hidden because it starts with a dot, and lists Finder / Terminal / VS Code / Windows reveal steps.
- **Review step** — the download box notes that `.agent/` inside the ZIP is hidden by default in Finder.

---

## How another AI should help with this project

When asked to modify this project:

1. Preserve the local-first, no-login MVP direction.
2. Preserve field-agnostic defaults.
3. Do not insert personal names or private user-specific context.
4. Keep generated files practical and readable.
5. Keep approval gates explicit.
6. Maintain the Norman UX principles:
   - Visibility
   - Feedback
   - Constraints
   - Mapping
   - Recovery
7. Prefer clean React component extraction if refactoring.
8. Preserve the wizard flow (one step on screen at a time) and the step bar's placement **below** the top bar.
9. When adding new colors, always include `dark:` variants so light mode keeps working.
10. Avoid adding backend complexity unless explicitly requested.
11. Avoid adding accounts/payments/cloud sync before the generator is polished.
12. Keep the core value: structured AI operator setup generation.

---

## Quick local dev commands

```bash
mkdir -p ~/.hermes && cd ~/.hermes
git clone https://github.com/krigrv/hermes-soul-studio.git
cd hermes-soul-studio
npm install
npm run dev
```

Open <http://localhost:3000>.

Build:

```bash
npm run build
npm run start
```

`~/.hermes` is hidden on macOS/Linux because the folder name starts with a dot. In Finder press `Cmd ⇧ .` to reveal it; in the terminal use `ls -la ~`; in VS Code's open dialog press `Cmd ⇧ .`.

---

## Quick deployment path

```txt
GitHub repo → Vercel deploy
```

Set `NEXT_PUBLIC_SITE_URL` to your deployed URL so OpenGraph metadata uses the right canonical.

---

## One-sentence summary for future AI agents

Hermes Soul Studio is a local-first Next.js wizard that walks users through 5 short steps to generate a downloadable AI operator setup (`.agent/` folder + per-app export files) with SOUL.md identity, workspace brains, skill maps, approval gates, external engine handoffs, test prompts, and backup scripts — all in the browser, with light/dark modes and zero accounts.
