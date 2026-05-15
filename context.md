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
Build the operating system for your AI operator.
```

Short product description:

```txt
A field-agnostic setup generator for turning any AI assistant into a structured operator with brains, skills, approval gates, external handoffs, exports, and backups.
```

This project should feel like a setup studio, not a generic form builder.

---

## Target users

The product is intentionally field-agnostic.

Potential users:

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

The app currently lets users:

1. Start from presets
2. Define the operator
3. Add/remove custom roles
4. Create/edit workspaces
5. Add workspaces from a library
6. Select external tools
7. Select export targets
8. Enable backup script generation
9. Preview generated `SOUL.md`
10. View generated file tree
11. View a live brain map
12. View setup quality score
13. Copy test prompts
14. Download a complete setup ZIP

The app is local-first. Generation happens in the browser using JSZip.

No database, login, or backend is currently required.

---

## Key UX principle

The design approach follows Don Norman-style usability principles.

### Visibility

Users should always see what is being created.

Current visibility features:

- Live `SOUL.md` preview
- Brain map
- Generated file tree
- File count
- Workspace count
- Tool count

### Feedback

Every action should visibly affect the generated system.

Current feedback features:

- Setup score updates
- Brain map updates
- File tree updates
- Role chips update
- Tool/export selection states update
- Test prompts change with workspaces

### Constraints

The UI should prevent unsafe AI operator behavior.

Current constraints:

- Approval rules per workspace
- Risk labels
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

- Test prompt generator
- Download ZIP
- Backup script generation
- Local-first browser generation

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

Current MVP stack:

```txt
Next.js
React
Tailwind CSS
JSZip
lucide-react
```

The project is built as a browser-only generator.

---

## Current source files

Typical project files:

```txt
app/page.jsx
app/layout.jsx
app/globals.css
tailwind.config.js
postcss.config.js
package.json
README.md
context.md
```

The main product logic currently lives in:

```txt
app/page.jsx
```

This includes:

- Workspace library
- Presets
- Tool options
- Export targets
- File generators
- Setup scoring
- UI components
- ZIP download logic

---

## Design direction

Visual style:

- Dark UI
- Orange accent
- Strong typography
- Rounded cards
- System-builder feel
- Premium but practical
- Studio/tool hybrid

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

Avoid hardcoding one user’s personal context.

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

- Added from the library
- Added manually
- Edited
- Removed

Every workspace needs:

```txt
name
purpose
tasks
risk
approvals
```

### Setup score

The setup score is heuristic, not a serious security score.

It checks:

- Identity completeness
- Workspace count
- Approval rule quality
- Tool routing
- Export targets

### ZIP generation

JSZip creates the downloadable setup in the browser.

The downloaded files are text-based Markdown/setup files.

---

## Known limitations

Current MVP limitations:

- No persistent save/load JSON config yet
- No undo for deleted workspaces yet
- No advanced validation warnings yet
- No install wizard yet
- No hosted backend or user accounts
- No template marketplace yet
- No direct GitHub/Vercel integration yet
- No live preview of generated `.agent` behavior
- No field-specific deep content packs yet

---

## High-value next improvements

Recommended next build priorities:

### 1. Save/load config JSON

Allow users to export and re-import their form state.

### 2. Undo delete workspace

Add recovery for accidental deletion.

### 3. Validation warnings

Examples:

```txt
You added Coding but did not enable Codex.
You selected high-risk Admin but approval rules are vague.
You have no Core workspace.
You selected exports but no external tools.
```

### 4. Better export modes

Make export targets more explicit:

```txt
Hermes
Claude
Codex
Cursor
ChatGPT
Generic local agent
```

### 5. Install script generator

Generate platform-specific install commands.

### 6. Field-specific packs

Examples:

```txt
Founder pack
Design studio pack
Developer pack
Student pack
Creator pack
Consultant pack
Agency pack
Researcher pack
```

### 7. Preview generated operator behavior

Show example:

```txt
When you ask: "Help me prioritize today"
The operator will route to: Core → prioritization-framework
```

### 8. Onboarding wizard mode

Turn the form into a guided step-by-step wizard for less technical users.

### 9. Advanced mode

Keep the current all-in-one editor for power users.

### 10. Deployment polish

Prepare for Vercel deployment with:

```txt
SEO metadata
Open Graph image
Landing page copy
Privacy statement
Terms note
```

---

## Recommended repository structure going forward

```txt
hermes-soul-studio/
├── app/
│   ├── page.jsx
│   ├── layout.jsx
│   └── globals.css
├── components/
│   ├── Field.jsx
│   ├── Section.jsx
│   ├── BrainMap.jsx
│   ├── SetupScore.jsx
│   └── WorkspaceEditor.jsx
├── lib/
│   ├── generators/
│   │   ├── soul.js
│   │   ├── brains.js
│   │   ├── skills.js
│   │   ├── exports.js
│   │   └── backup.js
│   ├── presets.js
│   ├── workspace-library.js
│   ├── score.js
│   └── zip.js
├── public/
├── context.md
├── README.md
├── package.json
└── tailwind.config.js
```

The current MVP is intentionally compact, but this structure is better for scaling.

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
8. Avoid adding backend complexity unless explicitly requested.
9. Avoid adding accounts/payments/cloud sync before the generator is polished.
10. Keep the core value: structured AI operator setup generation.

---

## Quick local dev commands

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

Build:

```bash
npm run build
```

---

## Quick deployment path

Recommended:

```txt
GitHub repo → Vercel deploy
```

Suggested repo name:

```txt
hermes-soul-studio
```

Suggested domain ideas:

```txt
hermessoulstudio.com
hermessoul.studio
soulmd.studio
operatorforge.ai
```

---

## One-sentence summary for future AI agents

Hermes Soul Studio is a local-first Next.js app that generates downloadable AI operator setups with SOUL.md identity, workspace brains, skill maps, approval gates, external engine handoffs, test prompts, and backup scripts.
