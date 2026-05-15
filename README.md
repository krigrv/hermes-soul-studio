# Hermes Soul Studio

Build the operating system for your AI operator.

Hermes Soul Studio is a local-first setup generator for structured AI operators. It helps users define:

- Operator identity
- Roles
- Workspaces
- Approval gates
- External tool routing
- Export targets
- Test prompts
- Backup scripts

## Run locally

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Deploy

Recommended:

```bash
vercel
```

## UX principles

The interface follows Don Norman-style usability principles:

- Visibility: live brain map, SOUL.md preview, generated file tree
- Feedback: setup score and generated count update in real time
- Constraints: approval gates prevent unsafe agent behavior
- Mapping: roles, workspaces, tools, and exports map to clear system behavior
- Recovery: backups, downloadable ZIP, and test prompts


## AI context

This repo includes `context.md` so other AI assistants can understand the product, architecture, UX principles, generated files, current limitations, and recommended next steps before editing.
