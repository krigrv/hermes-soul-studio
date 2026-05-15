# Hermes Soul Studio

**Build the operating system for your AI operator.**

A local-first generator that turns any AI assistant (Claude, Codex, Cursor, ChatGPT, or a self-hosted agent) into a structured operator with identity, workspaces, skills, approval gates, external handoffs, and local backups.

One messy chatbot → structured AI operator. No login. No cloud. No tracking.

---

## What it generates

A downloadable `.agent/` folder containing:

- `SOUL.md` — operator identity, tone, mission, boundaries
- Per-workspace brains (`rules.md`, `agents.md`, `skill-map.md`)
- Skills: `workspace-router`, `execution-handoff`, `external-skill-router`, `codex-handoff`, `claude-handoff`, `prioritization-framework`
- Export-ready files for Cursor rules, ChatGPT custom instructions, Codex & Claude skills
- An hourly backup script that excludes secrets and caches

Everything is generated in the browser. No data leaves your machine.

---

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Build

```bash
npm run build
npm run start
```

## Deploy

```bash
vercel
```

Set `NEXT_PUBLIC_SITE_URL` to your deployed URL so OpenGraph metadata uses the right canonical.

---

## Features

- **Presets** for founders, designers, developers, students, creators, consultants
- **Workspace library** for Core, Business, Coding, Design, Admin, Finance, Research, and more
- **Live setup score** with per-category breakdown
- **Validation warnings** that flag inconsistent setups (e.g. coding workspace without Codex)
- **Behavior preview** that shows how the operator would classify and route an example task
- **Save / load** the setup as JSON, or copy a share link that encodes the whole setup in the URL
- **Undo** for deleted workspaces
- **localStorage persistence** — your work survives a refresh

## Project structure

```
app/             Next.js app router (page.jsx, layout.jsx, globals.css)
components/      UI primitives (Field, Section, BrainMap, ValidationPanel, BehaviorPreview)
lib/             Pure logic — generators, score, validation, behavior, storage, utils, presets
public/          Static assets (favicon, OG image)
```

## UX principles

The interface follows Don Norman-style usability principles:

- **Visibility** — live brain map, SOUL.md preview, generated file tree, behavior preview
- **Feedback** — setup score and validations update in real time
- **Constraints** — approval gates prevent unsafe agent behavior
- **Mapping** — roles, workspaces, tools, and exports map to clear system behavior
- **Recovery** — undo, JSON export/import, share links, backups, test prompts

## AI context

The repo includes `context.md` so other AI assistants can understand the product, architecture, UX principles, generated files, and current limitations before editing.

## License

MIT
