# Hermes Soul Studio

**Build the OS for your AI operator.**

Hermes Soul Studio is a local-first generator that helps you define an AI operator end-to-end — its **soul** (identity, voice, what it must never do), its **brains** (workspace knowledge per area of your life), its **skills** (repeatable workflows), its **tool handoffs** (Codex, Claude, etc.), its **approval gates**, and an **hourly backup script**. Everything is produced in your browser as a downloadable `.agent/` folder. No login. No cloud. No tracking.

> A messy chatbot is not an operator. An operator has identity, a workspace map, skills, and a conscience.

<!-- TODO: drop a screenshot of the intro here, e.g. ![Hermes Soul Studio](public/screenshot.png) -->

---

## Try it

- **Hosted:** _(deploy to Vercel and paste the URL here)_
- **Local:** `mkdir -p ~/.hermes && cd ~/.hermes && git clone https://github.com/krigrv/hermes-soul-studio.git && cd hermes-soul-studio && npm install && npm run dev`

`~/.hermes` starts with a dot, so it's hidden on macOS/Linux. In Finder press `Cmd ⇧ .` to reveal it; in the terminal use `ls -la ~`.

---

## What it generates

A complete `.agent/` folder plus optional companion exports:

```
.agent/
├── SOUL.md                       # operator identity, voice, mission, boundaries
├── active_profile
├── profiles/<name>/
│   ├── SOUL.md
│   ├── brains/<workspace>/       # one folder per workspace
│   │   ├── SOUL.md
│   │   ├── rules.md
│   │   ├── agents.md
│   │   └── skill-map.md
│   ├── skills/                   # repeatable workflows
│   │   ├── workspace-router/
│   │   ├── execution-handoff/
│   │   ├── external-skill-router/
│   │   ├── codex-handoff/
│   │   ├── claude-handoff/
│   │   └── prioritization-framework/
│   └── system/
│       ├── execution-log.md
│       └── test-prompts.md
└── scripts/hourly-agent-backup.sh

exports/                          # optional bridge files
├── .cursor/rules.md
├── chatgpt-custom-instructions.txt
├── codex/SKILL.md
└── claude/SKILL.md
```

---

## The five steps

The site is a guided wizard, one screen at a time:

1. **About you** — your name, the operator's name (default `Hermes`), tone, what it should never do, the hats you wear.
2. **Your work** — workspaces shown as tabs. Each workspace has checkbox-driven Purpose / Common tasks / Approval-required-before, plus a Low / Medium / High risk radio. Type a known name (Core, Business, Coding, Design, Admin, Academics, Creative, Finance, Research, Education) to get smart suggestions; anything else gets a generic option set.
3. **Other tools** — tick the engines the operator can hand work off to (Codex, Claude, Drive, Notion, Telegram, GitHub).
4. **Companion files** — optional bridge files so Cursor / ChatGPT / Codex / Claude know how to play nicely with your operator.
5. **Backup** — optional hourly local backup script that skips secrets and caches.

Then a **Review** screen with file count, behavior preview, brain map, validation warnings, SOUL.md preview, test prompts, and the Download button.

---

## What's in the box

- **Soul** — `SOUL.md` defining identity, voice, mission, boundaries, classification format.
- **Brains** — per-workspace knowledge (purpose, tasks, risk level, approval rules, suggested agents).
- **Skills** — `workspace-router`, `execution-handoff`, `external-skill-router`, `codex-handoff`, `claude-handoff`, `prioritization-framework`.
- **Safety system** — approval gates per workspace, risk levels, default "ask before external action."
- **Tool routing** — explicit handoff prompts for Codex (code) and Claude (long reasoning).
- **Recovery** — `hourly-agent-backup.sh` excludes secrets/caches; undo for deleted workspaces; share-link encodes the full setup in a URL hash.
- **Test prompts** — generated examples for `workspace-router`, `execution-handoff`, `prioritization-framework`, etc.

---

## Features

- **Wizard flow** — one step on screen at a time, with a horizontal stepper below the header.
- **Checkbox-driven workspaces** — exhaustive option sets per workspace type, with "Add your own" for anything missing.
- **Live preview** — file count, brain map, behavior classifier, and SOUL.md preview update as you fill the form.
- **Validation warnings** — flags inconsistent setups (e.g. coding workspace without Codex enabled).
- **Light + dark + system theme** — toggle in the top bar, persisted.
- **Local-first persistence** — your work survives a refresh via `localStorage`.
- **Share link** — `#c=` hash encodes the whole config so you can send a setup to a teammate.
- **Undo** for deleted workspaces (6-second toast).
- **Donate** — UPI QR + ID for India-based supporters; the rest of the world will be added when the product earns it.

---

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm run start
```

Node 18+ recommended. The dev server uses Turbopack.

## Deploy

```bash
vercel
```

Set `NEXT_PUBLIC_SITE_URL` to your deployed URL so OpenGraph metadata uses the right canonical.

---

## Project structure

```
app/             Next.js app router (page.jsx, layout.jsx, globals.css)
components/      UI primitives (Field, CheckboxGroup, BrainMap, ValidationPanel, BehaviorPreview)
lib/             Pure logic — generators, score, validation, behavior, storage, utils, presets, workspace library + options
public/          favicon.svg, og.svg, qr.png
context.md       Full product spec for AI assistants editing this repo
LICENSE          MIT
```

The product logic lives in `app/page.jsx` (wizard + intro). The generators live in `lib/generators.js`.

---

## UX principles

The interface follows Don Norman-style usability principles:

- **Visibility** — live brain map, SOUL.md preview, file tree, behavior preview.
- **Feedback** — readiness % and validation warnings update in real time.
- **Constraints** — approval gates prevent unsafe operator behavior.
- **Mapping** — Soul → identity, Brains → workspaces, Skills → workflows, Handoffs → tool routing.
- **Recovery** — undo, share links, backups, test prompts.

---

## For AI assistants

`context.md` ships with the repo so other AI assistants understand the product, architecture, current state, and limitations before editing.

---

## Support

If this saved you time, you can tip via UPI inside the app (Donate button) or directly: `krigrv@upi`.

## License

MIT © Krishna Gaurav. See [LICENSE](LICENSE).
