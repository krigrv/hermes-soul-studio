"use client";

import React, { useMemo, useState } from "react";
import JSZip from "jszip";
import {
  ArrowRight,
  Brain,
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Gauge,
  GitBranch,
  Layers3,
  Plus,
  Rocket,
  ShieldCheck,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";

const WORKSPACE_LIBRARY = {
  core: {
    id: "core",
    name: "Core",
    purpose: "Personal operating system, goals, priorities, decisions, time planning.",
    tasks: "prioritization, planning, decision support, goals, routines",
    risk: "Medium",
    approvals: "outside-world actions, financial decisions, irreversible changes",
  },
  business: {
    id: "business",
    name: "Business",
    purpose: "Company, clients, proposals, strategy, sales, operations.",
    tasks: "proposals, client communication, strategy, marketing, sales, operations",
    risk: "Medium",
    approvals: "client delivery, publishing, pricing, external saves, public messages",
  },
  coding: {
    id: "coding",
    name: "Coding",
    purpose: "Software, debugging, repos, agents, automations, deployment.",
    tasks: "debugging, MVP builds, repo inspection, tests, deployment, automations",
    risk: "High",
    approvals: "file edits, destructive commands, production changes, database resets, deployments",
  },
  design: {
    id: "design",
    name: "Design",
    purpose: "UX, UI, interaction design, product flows, design systems, critique.",
    tasks: "UX audit, UI critique, design systems, product flows, wireframes, microcopy",
    risk: "Low",
    approvals: "publishing externally, client delivery, live product changes",
  },
  education: {
    id: "education",
    name: "Education",
    purpose: "Teaching, curriculum, workshops, assignments, student feedback.",
    tasks: "curriculum, lesson plans, assignments, critique, workshops, student feedback",
    risk: "Low",
    approvals: "publishing curriculum, sending to students, public announcements",
  },
  admin: {
    id: "admin",
    name: "Admin",
    purpose: "Emails, documents, forms, banking, insurance, official communication.",
    tasks: "emails, forms, document review, applications, banking, insurance, official letters",
    risk: "High",
    approvals: "sending, submitting, signing, uploading, legal claims, financial decisions",
  },
  academics: {
    id: "academics",
    name: "Academics",
    purpose: "Exams, reports, research, notes, papers, assignments.",
    tasks: "exam prep, notes, reports, research, numericals, syllabus analysis, paper review",
    risk: "Low",
    approvals: "final submission, uploading to institution, public sharing",
  },
  creative: {
    id: "creative",
    name: "Creative",
    purpose: "Prompts, posters, campaigns, art direction, lyrics, visual concepts.",
    tasks: "image prompts, poster concepts, moodboards, campaigns, creative writing, lyrics",
    risk: "Low",
    approvals: "publishing externally, sending to clients, paid generation tools",
  },
  finance: {
    id: "finance",
    name: "Finance",
    purpose: "Budgets, invoices, spending decisions, pricing, financial planning.",
    tasks: "budgeting, pricing, invoices, payment tracking, expense review, financial planning",
    risk: "High",
    approvals: "payments, purchases, bank actions, financial commitments, tax/legal claims",
  },
  research: {
    id: "research",
    name: "Research",
    purpose: "Knowledge synthesis, market scans, reports, evidence gathering.",
    tasks: "research synthesis, market scans, notes, reports, source comparison, summaries",
    risk: "Medium",
    approvals: "public claims, client-facing reports, medical/legal/financial advice",
  },
};

const PRESETS = [
  {
    id: "founder",
    title: "Founder / Operator",
    description: "Strategy, sales, product, hiring, finance, admin.",
    roles: "Founder, Operator, Builder",
    workspaces: ["core", "business", "coding", "finance", "admin", "creative"],
    tools: { codex: true, claude: true, googleDrive: true, telegram: false, notion: true, github: true },
  },
  {
    id: "designer",
    title: "Design Studio",
    description: "Branding, proposals, UX, creative direction, client delivery.",
    roles: "Founder, Creative Director, Designer, Strategist",
    workspaces: ["core", "business", "design", "creative", "admin", "education"],
    tools: { codex: false, claude: true, googleDrive: true, telegram: true, notion: true, github: false },
  },
  {
    id: "developer",
    title: "Developer / Vibecoder",
    description: "Coding, debugging, agents, deployment, product builds.",
    roles: "Developer, Builder, Product Maker, Operator",
    workspaces: ["core", "coding", "design", "research", "admin", "creative"],
    tools: { codex: true, claude: true, googleDrive: false, telegram: false, notion: false, github: true },
  },
  {
    id: "student",
    title: "Student",
    description: "Exams, notes, reports, projects, scheduling, applications.",
    roles: "Student, Researcher, Project Builder",
    workspaces: ["core", "academics", "coding", "admin", "creative"],
    tools: { codex: true, claude: true, googleDrive: true, telegram: false, notion: true, github: true },
  },
  {
    id: "creator",
    title: "Creator",
    description: "Content, scripts, campaigns, publishing, brand deals.",
    roles: "Creator, Writer, Strategist, Publisher",
    workspaces: ["core", "creative", "business", "admin", "research"],
    tools: { codex: false, claude: true, googleDrive: true, telegram: false, notion: true, github: false },
  },
  {
    id: "consultant",
    title: "Consultant",
    description: "Client work, research, proposals, delivery, admin.",
    roles: "Consultant, Advisor, Strategist, Operator",
    workspaces: ["core", "business", "research", "admin", "finance", "creative"],
    tools: { codex: false, claude: true, googleDrive: true, telegram: false, notion: true, github: false },
  },
];

const TOOL_OPTIONS = [
  { key: "codex", label: "Codex", description: "Repo debugging, code execution, tests, implementation." },
  { key: "claude", label: "Claude", description: "Critique, writing polish, strategy refinement, second opinion." },
  { key: "googleDrive", label: "Google Drive", description: "External saves and document delivery." },
  { key: "telegram", label: "Telegram", description: "Notifications and delivery alerts." },
  { key: "notion", label: "Notion", description: "Docs, planning, knowledge base." },
  { key: "github", label: "GitHub", description: "Issues, repos, PRs, code history." },
];

const EXPORT_TARGETS = [
  { key: "hermes", label: "Hermes / Local Agent", description: "Full .agent folder with brains and skills." },
  { key: "codex", label: "Codex Skills", description: "Code handoff and review skill files." },
  { key: "claude", label: "Claude Skills", description: "Claude-friendly critique and refinement handoffs." },
  { key: "cursor", label: "Cursor Rules", description: "A rules file for coding agents and IDE assistants." },
  { key: "chatgpt", label: "ChatGPT Instructions", description: "Copy-ready custom instruction summary." },
];

function slugify(value) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || "workspace"
  );
}

function safe(value, fallback = "Not specified") {
  return value && value.trim() ? value.trim() : fallback;
}

function splitList(value) {
  return value.split(",").map((v) => v.trim()).filter(Boolean);
}

function makeSoul({ userName, companyName, operatorName, tone, roles, avoid, profileName, workspaces }) {
  const workspaceList = workspaces.map((w) => `- ${w.name}: ${w.purpose}`).join("\n");
  return `# SOUL.md\n\n## Operator Identity\n\nYou are ${operatorName}, ${userName}'s autonomous operator and thought partner.\n\nYou are responsible for routing work, protecting context boundaries, executing safe internal tasks, preparing external handoffs, and asking for approval before risky or irreversible actions.\n\nProfile: ${profileName}\n\nCompany / Organization: ${safe(companyName, "Not specified")}\n\n---\n\n# 1. Identity\n\nYou serve ${userName} across multiple workspaces:\n\n${workspaceList}\n\nYou do not behave like a single-purpose chatbot. You classify work, choose the correct workspace, load the correct brain, select the correct skill, and follow approval rules.\n\nRoles:\n${splitList(roles).map((r) => `- ${r}`).join("\n") || "- Not specified"}\n\n---\n\n# 2. Tone & Voice\n\nUse this tone:\n\n${tone}\n\nPrefer:\n\n- Clear headings\n- Practical steps\n- Paste-ready outputs\n- Terminal-ready commands when useful\n- Strong critique when useful\n- Specific next actions\n\nAvoid:\n\n${splitList(avoid).map((a) => `- ${a}`).join("\n") || "- Generic advice"}\n\n---\n\n# 3. Mission\n\nYour mission is to help ${userName} think clearly, move faster, and execute with better judgment.\n\nYou exist to:\n\n- Classify tasks\n- Route work\n- Draft outputs\n- Flag risks\n- Suggest better next steps\n- Protect time and attention\n- Use the right tool for the right job\n\n---\n\n# 4. Boundaries\n\nYou may autonomously:\n\n- Think\n- Suggest\n- Draft\n- Rewrite\n- Structure\n- Plan\n- Critique\n- Prepare commands\n- Create internal documents\n- Summarize\n\nYou must ask before:\n\n- Sending messages or emails\n- Publishing content\n- Making purchases\n- Deleting files\n- Submitting forms\n- Uploading documents\n- Making financial decisions\n- Editing production/live systems\n- Making irreversible changes\n- Sharing client-facing work externally\n\nDefault rule:\n\nIf the action stays inside chat or local draft, move.\n\nIf the action affects the outside world, ask.\n\n---\n\n# 5. Workspace Intelligence\n\nBefore answering, classify the task into the correct workspace.\n\nUse only the context needed for that workspace.\n\nDo not mix workspaces unless ${userName} explicitly connects them.\n\n---\n\n# 6. Task Classification Format\n\nWhen classifying, use:\n\nWorkspace:\nBrain Path:\nTask Type:\nRelevant Brain Files:\nMatching Skill / Pipeline:\nSub-skills:\nRisk Level:\nNeeds Approval:\nNext Step:\n\n---\n\n# 7. Operating Principle\n\nWorkspace first.\nBrain second.\nSkill third.\nApproval before external action.\nExecution only after safe handoff.\n`;
}

function makeBrainSoul(workspace) {
  return `# ${workspace.name} Brain\n\n## Purpose\n\n${workspace.purpose}\n\n## Common Tasks\n\n${splitList(workspace.tasks).map((t) => `- ${t}`).join("\n") || "- Not specified"}\n\n## Risk Level\n\n${workspace.risk}\n\n## Approval Rules\n\nAsk before:\n\n${splitList(workspace.approvals).map((a) => `- ${a}`).join("\n") || "- Any external or irreversible action"}\n\n## Default Behavior\n\n- Use only this workspace's relevant context.\n- Draft internally when safe.\n- Pause before external, destructive, financial, legal, production, or client-facing actions.\n- End major work with an execution summary.\n`;
}

function makeSkillMap(workspace, profileName) {
  const slug = slugify(workspace.name);
  return `# ${workspace.name} Skill Map\n\n## Workspace\n\n${workspace.name}\n\n## Brain Path\n\n.agent/profiles/${profileName}/brains/${slug}/\n\n## Use For\n\n${splitList(workspace.tasks).map((t) => `- ${t}`).join("\n") || "- Not specified"}\n\n## Suggested Native Skills\n\n- ${slug}-planner\n- ${slug}-drafter\n- ${slug}-reviewer\n\n## Approval Required Before\n\n${splitList(workspace.approvals).map((a) => `- ${a}`).join("\n") || "- Any external or irreversible action"}\n`;
}

function makeWorkspaceRouter({ profileName, workspaces }) {
  const map = workspaces
    .map((w) => {
      const slug = slugify(w.name);
      return `## ${w.name}\n\nUse for: ${w.tasks}\n\nOutput:\n\nWorkspace: ${w.name}  \nBrain Path: .agent/profiles/${profileName}/brains/${slug}/  \nTask Type: [classify task]  \nRelevant Brain Files: SOUL.md, rules.md, agents.md, skill-map.md  \nMatching Skill / Pipeline: [native skill or handoff]  \nSub-skills: —  \nRisk Level: ${w.risk}  \nNeeds Approval: Yes before ${w.approvals}  \nNext Step: Draft internally or ask for missing context  `;
    })
    .join("\n\n---\n\n");

  return `# Workspace Router Skill\n\nUse this skill to classify every task before execution.\n\n## Core Rule\n\nAlways classify in this order:\n\nWorkspace:\nBrain Path:\nTask Type:\nRelevant Brain Files:\nMatching Skill / Pipeline:\nSub-skills:\nRisk Level:\nNeeds Approval:\nNext Step:\n\nNever start with only \"Classification\" or \"Relevant skills\".\n\nWorkspace and brain selection always come before skills.\n\nAll brain paths must use the profile-local path first.\n\n---\n\n# Workspace Map\n\n${map}\n\n---\n\n# Execution Rule\n\nIf user says \"classify only\", do not execute.\n\nIf user says \"go\", \"proceed\", \"run it\", or \"execute\", route to:\n\nexecution-handoff\n`;
}

function makeExecutionHandoff() {
  return `# Execution Handoff Skill\n\nUse this when the user says go, proceed, execute, run it, start, continue, or do it after classification.\n\n## Execution Order\n\n1. Restate execution target\n2. Check permission\n3. Use correct workspace skill\n4. Execute only safe/internal steps\n5. Pause before external or irreversible actions\n6. Summarize result\n\n## Internal actions allowed\n\n- Drafting\n- Planning\n- Rewriting\n- Critiquing\n- Summarizing\n- Preparing commands\n- Creating internal text\n\n## Approval required before\n\n- Sending\n- Publishing\n- Saving externally\n- Uploading\n- Submitting\n- Buying\n- Deleting\n- Editing production\n- Running destructive commands\n\n## Output Format\n\nStep 1 — Execution Target\n\nWorkspace:\nTask Type:\nSkill / Pipeline:\nRisk Level:\nApproval Needed:\n\nStep 2 — Permission Check\n\nStep 3 — Execution\n\nStep 4 — Execution Summary\n\n- What was done\n- What is pending\n- What needs approval\n- Next recommended action\n`;
}

function makeExternalRouter(tools) {
  return `# External Skill Router\n\nUse this when a task may be better handled by another engine such as Codex, Claude, or another specialist tool.\n\n## Enabled Tools\n\n${Object.entries(tools).filter(([, v]) => v).map(([k]) => `- ${k}`).join("\n") || "- None selected"}\n\n## Engine Rules\n\nMain operator:\n\n- Routing\n- Prioritization\n- Workspace context\n- Approval control\n- Internal drafting\n\nCodex:\n\n- Repo inspection\n- Debugging\n- Code edits\n- Tests\n- Refactoring\n- Feature implementation\n- Build/deployment diagnosis\n\nClaude:\n\n- Long reasoning\n- Writing polish\n- Strategy critique\n- Proposal refinement\n- Second-opinion review\n- Research synthesis\n- Design critique\n\n## Output Format\n\nWorkspace:\nTask Type:\nBest Engine:\nExternal Skill:\nUse Mode: native / handoff / import / mirror\nReason:\nApproval Needed:\nHandoff Prompt:\n`;
}

function makeCodexHandoff() {
  return `# Codex Handoff\n\nUse only for coding/repo tasks.\n\n## Required Handoff Format\n\n## Codex Task\n\nOne sentence describing the job.\n\n## Repo / Folder\n\nWhere Codex should run.\n\n## Context\n\nWhat exists already.\n\n## Goal\n\nWhat should be true after the task.\n\n## Constraints\n\n- Make minimal, high-confidence changes.\n- Do not delete files unless approved.\n- Do not touch secrets or .env files.\n- Do not make production changes.\n- Preserve existing architecture unless necessary.\n- Explain changes before finalizing.\n\n## Files To Inspect\n\nList likely files.\n\n## Safe Commands\n\nList read-only or local-safe commands.\n\n## Approval Boundaries\n\nState what requires approval.\n`;
}

function makeClaudeHandoff() {
  return `# Claude Handoff\n\nUse when a task benefits from long-context reasoning, writing polish, critique, strategy refinement, research synthesis, or second-opinion review.\n\n## Required Handoff Format\n\n## Claude Task\n\nOne sentence describing the job.\n\n## Workspace\n\nWhich workspace this belongs to.\n\n## Context\n\nWhat Claude needs to know.\n\n## Goal\n\nWhat the output should achieve.\n\n## Relevant Brain Files\n\nList workspace files used by the operator.\n\n## Constraints\n\n- Preserve user intent.\n- Do not invent facts.\n- Keep output practical.\n- Respect workspace tone.\n\n## Expected Output\n\nDefine final format.\n\n## Approval Boundaries\n\nState what Claude must not do.\n`;
}

function makePrioritizationFramework() {
  return `# Prioritization Framework\n\nUse when the user asks what to focus on first, how to prioritize, how to plan the day/week, or how to choose between workspaces.\n\n## Ask Minimum Questions\n\nAsk only what is needed:\n\n1. Deadlines\n2. Fires/blockers\n3. Time available\n4. Current energy\n5. Revenue/risk impact if relevant\n\n## Scoring\n\nRank tasks by:\n\n- Urgency\n- Risk\n- Business impact\n- Long-term leverage\n- Energy fit\n- Effort required\n- Whether it blocks other work\n\n## Output Format\n\n## Priority Order\n\n## Focus Now\n\n## Why This First\n\n## What Can Wait\n\n## What To Ignore\n\n## Next 3 Actions\n\n## Suggested Time Blocks\n\n## Risk Notes\n\n## Rule\n\nDo not execute tasks from other workspaces. Only prioritize. Route execution after user confirms.\n`;
}

function makeBackupScript({ backupEnabled, retention }) {
  if (!backupEnabled) return "# Backup disabled by user.\n";
  return `#!/bin/bash\n\nset -e\n\nTIMESTAMP=$(date +"%Y%m%d_%H%M%S")\nSOURCE="$HOME/.agent"\nDEST="$HOME/AgentBackups/hourly"\nBACKUP_FILE="$DEST/agent-backup-$TIMESTAMP.tar.gz"\nLOG_FILE="$DEST/backup.log"\n\nmkdir -p "$DEST"\n\necho "[$(date)] Starting backup..." >> "$LOG_FILE"\n\ntar \\\n  --exclude="$SOURCE/logs" \\\n  --exclude="$SOURCE/sessions" \\\n  --exclude="$SOURCE/cache" \\\n  --exclude="$SOURCE/state-snapshots" \\\n  --exclude="$SOURCE/.env" \\\n  --exclude="$SOURCE/*secret*" \\\n  --exclude="$SOURCE/*auth*" \\\n  --exclude="$SOURCE/*token*" \\\n  -czf "$BACKUP_FILE" \\\n  "$SOURCE/SOUL.md" \\\n  "$SOURCE/active_profile" \\\n  "$SOURCE/skills" \\\n  "$SOURCE/profiles" 2>> "$LOG_FILE" || true\n\necho "[$(date)] Backup created: $BACKUP_FILE" >> "$LOG_FILE"\n\nls -1t "$DEST"/agent-backup-*.tar.gz 2>/dev/null | tail -n +${Number(retention) + 1} | xargs rm -f\n`;
}

function makeCursorRules({ operatorName, workspaces }) {
  return `# Cursor Rules\n\nYou are ${operatorName}, operating inside a code editor.\n\nRules:\n\n- Prefer minimal, high-confidence changes.\n- Do not touch .env, secrets, auth files, or production config without explicit approval.\n- Do not delete files without approval.\n- Explain file changes before applying them.\n- Run tests or build checks when safe.\n- Preserve existing architecture unless there is a strong reason.\n\nRelevant workspaces:\n${workspaces.map((w) => `- ${w.name}: ${w.purpose}`).join("\n")}\n`;
}

function makeChatGPTInstructions({ userName, companyName, operatorName, tone, roles, avoid, workspaces }) {
  return `You are ${operatorName}, ${userName}'s structured AI operator.\n\nCompany / Organization: ${safe(companyName, "Not specified")}\n\nRoles: ${roles}\n\nTone: ${tone}\n\nAvoid: ${avoid}\n\nAlways classify work before answering when useful.\n\nWorkspaces:\n${workspaces.map((w) => `- ${w.name}: ${w.purpose}`).join("\n")}\n\nAsk approval before sending, publishing, buying, deleting, submitting, editing production, or making irreversible changes.\n`;
}

function makeTestPrompts(workspaces) {
  const first = workspaces[0]?.name || "Core";
  const second = workspaces[1]?.name || "Business";
  return [
    `Use workspace-router only.\n\nClassify this task only. Do not run it.\n\nTask: Help me decide what to focus on first across ${workspaces.map((w) => w.name).join(", ")}.`,
    `Use workspace-router only.\n\nClassify this task only. Do not run it.\n\nTask: Draft an internal plan for a ${second} task without publishing or sending anything.`,
    `Proceed using execution-handoff. Draft internally only.`,
    `Use external-skill-router.\n\nI have a coding bug in a repo. Tell me whether the main operator, Codex, or Claude should handle it. Do not execute.`,
    `Use prioritization-framework.\n\nI have too many things to do today across ${first} and ${second}. Ask only the minimum questions needed, then rank priorities.`,
  ];
}

function generateFiles(config) {
  const profile = slugify(config.profileName || "default");
  const files = {};
  const base = `.agent`;
  const profileBase = `${base}/profiles/${profile}`;

  files[`${base}/active_profile`] = profile;
  files[`${base}/SOUL.md`] = makeSoul({ ...config, profileName: profile });
  files[`${profileBase}/SOUL.md`] = files[`${base}/SOUL.md`];

  config.workspaces.forEach((w) => {
    const slug = slugify(w.name);
    files[`${profileBase}/brains/${slug}/SOUL.md`] = makeBrainSoul(w);
    files[`${profileBase}/brains/${slug}/rules.md`] = `# ${w.name} Rules\n\nRisk level: ${w.risk}\n\nAsk approval before:\n\n${splitList(w.approvals).map((a) => `- ${a}`).join("\n") || "- External actions"}\n`;
    files[`${profileBase}/brains/${slug}/agents.md`] = `# ${w.name} Agents\n\nSuggested agents:\n\n- Planner\n- Drafter\n- Critic\n- Reviewer\n- Execution Assistant\n`;
    files[`${profileBase}/brains/${slug}/skill-map.md`] = makeSkillMap(w, profile);
  });

  const skills = {
    "workspace-router": makeWorkspaceRouter({ profileName: profile, workspaces: config.workspaces }),
    "execution-handoff": makeExecutionHandoff(),
    "external-skill-router": makeExternalRouter(config.tools),
    "codex-handoff": makeCodexHandoff(),
    "claude-handoff": makeClaudeHandoff(),
    "prioritization-framework": makePrioritizationFramework(),
  };

  Object.entries(skills).forEach(([name, content]) => {
    files[`${profileBase}/skills/${name}/SKILL.md`] = content;
    files[`${base}/skills/${name}/SKILL.md`] = content;
  });

  files[`${profileBase}/system/execution-log.md`] = `# Execution Log\n\n## Log Format\n\n### YYYY-MM-DD — Title\n\nWorkspace:\nTask:\nWhat changed:\nFiles touched:\nResult:\nNext step:\n`;
  files[`${profileBase}/system/test-prompts.md`] = `# Test Prompts\n\n${makeTestPrompts(config.workspaces).map((p, i) => `## Test ${i + 1}\n\n\`\`\`txt\n${p}\n\`\`\``).join("\n\n")}`;
  files[`${base}/scripts/hourly-agent-backup.sh`] = makeBackupScript(config);

  if (config.exportTargets.cursor) files[`exports/.cursor/rules.md`] = makeCursorRules(config);
  if (config.exportTargets.chatgpt) files[`exports/chatgpt-custom-instructions.txt`] = makeChatGPTInstructions(config);
  if (config.exportTargets.codex) files[`exports/codex/SKILL.md`] = makeCodexHandoff();
  if (config.exportTargets.claude) files[`exports/claude/SKILL.md`] = makeClaudeHandoff();

  files[`README.md`] = `# ${config.operatorName} Setup\n\nGenerated by Hermes Soul Studio.\n\n## Install\n\nCopy the .agent folder into your home directory or adapt paths to your agent runtime.\n\n## Test\n\nUse workspace-router only.\n\nClassify this task only. Do not run it.\n\nTask: Help me decide what to focus on first across my workspaces.\n`;

  return files;
}

function scoreSetup(config) {
  const scores = [
    { label: "Identity", value: Math.min(100, [config.userName, config.operatorName, config.roles, config.tone].filter((v) => v && v.trim().length > 4).length * 25) },
    { label: "Workspaces", value: Math.min(100, config.workspaces.length * 18 + (config.workspaces.length >= 4 ? 20 : 0)) },
    { label: "Approval Safety", value: Math.round(config.workspaces.reduce((acc, w) => acc + (w.approvals.trim().length > 15 ? 1 : 0), 0) / Math.max(config.workspaces.length, 1) * 100) },
    { label: "Tool Routing", value: Math.min(100, Object.values(config.tools).filter(Boolean).length * 18) },
    { label: "Exports", value: Math.min(100, Object.values(config.exportTargets).filter(Boolean).length * 20) },
  ];
  const overall = Math.round(scores.reduce((acc, s) => acc + s.value, 0) / scores.length);
  return { overall, scores };
}

function Field({ label, value, onChange, placeholder, textarea = false }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none transition focus:border-orange-500" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 outline-none transition focus:border-orange-500" />
      )}
    </label>
  );
}

function Section({ icon: Icon, eyebrow, title, children }) {
  return (
    <section className="rounded-[2rem] border border-neutral-800 bg-neutral-950/70 p-5 shadow-2xl shadow-black/20 md:p-7">
      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-3 text-orange-500"><Icon size={20} /></div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">{eyebrow}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-50">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function BrainMap({ workspaces }) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-black/40 p-4">
      <div className="mx-auto mb-4 w-fit rounded-2xl border border-orange-500/40 bg-orange-500/10 px-4 py-3 text-center text-sm font-bold text-orange-200">Core Brain</div>
      <div className="mx-auto mb-4 h-7 w-px bg-neutral-700" />
      <div className="mx-auto mb-4 w-fit rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-center text-sm font-bold text-neutral-100">Workspace Router</div>
      <div className="mx-auto mb-4 h-7 w-px bg-neutral-700" />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {workspaces.map((w) => (
          <div key={w.id} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3">
            <p className="text-sm font-semibold text-white">{w.name}</p>
            <p className="mt-1 line-clamp-2 text-xs text-neutral-500">{w.purpose}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HermesSoulStudio() {
  const [userName, setUserName] = useState("Your Name");
  const [operatorName, setOperatorName] = useState("Hermes");
  const [companyName, setCompanyName] = useState("Your Company");
  const [profileName, setProfileName] = useState("default");
  const [roles, setRoles] = useState("Founder, Designer, Developer, Operator");
  const [newRole, setNewRole] = useState("");
  const [tone, setTone] = useState("Direct, practical, sharp, structured, lightly witty when useful.");
  const [avoid, setAvoid] = useState("generic advice, corporate fluff, unnecessary questions, fake certainty");
  const [workspaces, setWorkspaces] = useState([WORKSPACE_LIBRARY.core, WORKSPACE_LIBRARY.business, WORKSPACE_LIBRARY.coding, WORKSPACE_LIBRARY.creative]);
  const [tools, setTools] = useState({ codex: true, claude: true, googleDrive: false, telegram: false, notion: false, github: true });
  const [exportTargets, setExportTargets] = useState({ hermes: true, codex: true, claude: true, cursor: true, chatgpt: true });
  const [backupEnabled, setBackupEnabled] = useState(true);
  const [retention, setRetention] = useState(72);
  const [copied, setCopied] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(null);

  const config = { userName, companyName, operatorName, profileName, roles, tone, avoid, workspaces, tools, exportTargets, backupEnabled, retention };
  const files = useMemo(() => generateFiles(config), [userName, companyName, operatorName, profileName, roles, tone, avoid, workspaces, tools, exportTargets, backupEnabled, retention]);
  const profileSlug = slugify(profileName);
  const soulPreview = files[`.agent/profiles/${profileSlug}/SOUL.md`];
  const testPrompts = useMemo(() => makeTestPrompts(workspaces), [workspaces]);
  const setupScore = useMemo(() => scoreSetup(config), [config]);
  const roleList = useMemo(() => splitList(roles), [roles]);
  const missingLibraryWorkspaces = Object.values(WORKSPACE_LIBRARY).filter(
    (item) => !workspaces.some((workspace) => slugify(workspace.name) === slugify(item.name))
  );

  const applyPreset = (preset) => {
    setRoles(preset.roles);
    setWorkspaces(preset.workspaces.map((id) => ({ ...WORKSPACE_LIBRARY[id] })));
    setTools((prev) => ({ ...prev, ...preset.tools }));
  };

  const addWorkspace = () => setWorkspaces((prev) => [...prev, { id: crypto.randomUUID?.() || String(Date.now()), name: "New Workspace", purpose: "Describe what this workspace handles.", tasks: "planning, drafting, reviewing", risk: "Medium", approvals: "external actions, irreversible changes" }]);
  const addWorkspaceFromLibrary = (workspace) => setWorkspaces((prev) => [...prev, { ...workspace, id: `${workspace.id}-${Date.now()}` }]);
  const addRole = () => {
    const value = newRole.trim();
    if (!value) return;
    const existing = splitList(roles).map((item) => item.toLowerCase());
    if (existing.includes(value.toLowerCase())) {
      setNewRole("");
      return;
    }
    setRoles((prev) => [...splitList(prev), value].join(", "));
    setNewRole("");
  };
  const removeRole = (role) => setRoles((prev) => splitList(prev).filter((item) => item !== role).join(", "));
  const updateWorkspace = (index, key, value) => setWorkspaces((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  const deleteWorkspace = (index) => setWorkspaces((prev) => prev.filter((_, i) => i !== index));

  const downloadZip = async () => {
    const zip = new JSZip();
    Object.entries(files).forEach(([path, content]) => zip.file(path, content));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hermes-soul-studio-${slugify(operatorName)}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const installScript = `# Generated by Hermes Soul Studio\n# Unzip the downloaded file, then run:\ncp -R .agent "$HOME/.agent"\nchmod +x "$HOME/.agent/scripts/hourly-agent-backup.sh"\n# Adapt .agent path to .hermes if using Hermes runtime.`;
  const copyInstall = async () => { await navigator.clipboard.writeText(installScript); setCopied(true); setTimeout(() => setCopied(false), 1600); };
  const copyPrompt = async (prompt, index) => { await navigator.clipboard.writeText(prompt); setCopiedPrompt(index); setTimeout(() => setCopiedPrompt(null), 1600); };

  return (
    <div className="min-h-screen bg-[#090909] text-neutral-100">
      <div className="pointer-events-none fixed inset-0 opacity-40" aria-hidden="true">
        <div className="absolute left-[-10%] top-[-10%] h-80 w-80 rounded-full bg-orange-600 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-96 w-96 rounded-full bg-purple-700 blur-[140px]" />
      </div>

      <main className="relative mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <header className="mb-10 grid gap-8 rounded-[2.5rem] border border-neutral-800 bg-neutral-950/80 p-6 shadow-2xl shadow-black/30 md:grid-cols-[1.25fr_0.75fr] md:p-10">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-300"><Sparkles size={16} /> SOUL.md generator for structured AI operators</div>
            <h1 className="max-w-4xl text-5xl font-black tracking-[-0.06em] text-white md:text-7xl">Hermes Soul Studio</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-300">Build a field-agnostic AI operating system: identity, workspaces, skills, approval gates, external handoffs, exports, and local backups.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={downloadZip} className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-500"><Download size={17} /> Download setup ZIP</button>
              <button onClick={copyInstall} className="inline-flex items-center gap-2 rounded-2xl border border-neutral-700 px-5 py-3 text-sm font-bold text-neutral-100 transition hover:border-neutral-500">{copied ? <Check size={17} /> : <Code2 size={17} />}{copied ? "Copied" : "Copy install note"}</button>
            </div>
          </div>

          <div className="grid gap-3 self-end">
            {[[Brain, "Core Brain", "Identity, priorities, boundaries"], [Layers3, "Workspace Brains", "Business, coding, design, admin"], [Gauge, `Setup Score ${setupScore.overall}%`, "Identity, safety, exports, tools"], [ExternalLink, "External Engines", "Codex and Claude routing"]].map(([Icon, title, desc]) => (
              <div key={title} className="flex items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4"><Icon className="text-orange-500" size={20} /><div><p className="font-semibold">{title}</p><p className="text-sm text-neutral-500">{desc}</p></div></div>
            ))}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <Section icon={Rocket} eyebrow="Presets" title="Start from a role template">
              <div className="grid gap-3 md:grid-cols-2">
                {PRESETS.map((preset) => (
                  <button key={preset.id} onClick={() => applyPreset(preset)} className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 text-left transition hover:border-orange-500">
                    <p className="font-semibold text-white">{preset.title}</p>
                    <p className="mt-2 text-sm leading-6 text-neutral-500">{preset.description}</p>
                  </button>
                ))}
              </div>
            </Section>

            <Section icon={Wand2} eyebrow="Step 01" title="Define the operator">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Your name" value={userName} onChange={setUserName} />
                <Field label="Operator name" value={operatorName} onChange={setOperatorName} />
                <Field label="Your company / organization" value={companyName} onChange={setCompanyName} />
                <Field label="Profile name" value={profileName} onChange={setProfileName} />
                <div className="md:col-span-2">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Roles</span>
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {roleList.map((role) => (
                        <button
                          key={role}
                          onClick={() => removeRole(role)}
                          className="rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-200 transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-200"
                          title="Click to remove role"
                        >
                          {role} ×
                        </button>
                      ))}
                      {roleList.length === 0 && <p className="text-sm text-neutral-500">Add at least one role so the operator knows who it serves.</p>}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addRole();
                          }
                        }}
                        placeholder="Add role, e.g. Founder, Lawyer, Doctor, Creator"
                        className="min-w-0 flex-1 rounded-xl border border-neutral-800 bg-black px-3 py-2 text-sm text-neutral-100 outline-none transition focus:border-orange-500"
                      />
                      <button onClick={addRole} className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-500">
                        Add
                      </button>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-neutral-500">Roles shape defaults. Workspaces define what the operator can actually do.</p>
                  </div>
                </div>
                <div className="md:col-span-2"><Field label="Tone" value={tone} onChange={setTone} textarea /></div>
                <div className="md:col-span-2"><Field label="Avoid" value={avoid} onChange={setAvoid} textarea /></div>
              </div>
            </Section>

            <Section icon={Layers3} eyebrow="Step 02" title="Build workspaces">
              <div className="space-y-4">
                {workspaces.map((workspace, index) => (
                  <div key={workspace.id} className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-4">
                    <div className="mb-4 flex items-center justify-between gap-4"><p className="font-semibold text-neutral-200">Workspace {index + 1}</p><button onClick={() => deleteWorkspace(index)} className="rounded-xl border border-neutral-800 p-2 text-neutral-500 transition hover:border-red-500 hover:text-red-400"><Trash2 size={16} /></button></div>
                    <div className="grid gap-3">
                      <Field label="Name" value={workspace.name} onChange={(v) => updateWorkspace(index, "name", v)} />
                      <Field label="Purpose" value={workspace.purpose} onChange={(v) => updateWorkspace(index, "purpose", v)} textarea />
                      <Field label="Common tasks" value={workspace.tasks} onChange={(v) => updateWorkspace(index, "tasks", v)} textarea />
                      <div className="grid gap-3 md:grid-cols-2"><Field label="Risk" value={workspace.risk} onChange={(v) => updateWorkspace(index, "risk", v)} /><Field label="Approval required for" value={workspace.approvals} onChange={(v) => updateWorkspace(index, "approvals", v)} /></div>
                    </div>
                  </div>
                ))}
                <div className="rounded-3xl border border-neutral-800 bg-black/30 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Add from library</p>
                  <div className="flex flex-wrap gap-2">
                    {missingLibraryWorkspaces.slice(0, 8).map((workspace) => (
                      <button
                        key={workspace.id}
                        onClick={() => addWorkspaceFromLibrary(workspace)}
                        className="rounded-full border border-neutral-800 px-3 py-2 text-xs font-semibold text-neutral-300 transition hover:border-orange-500 hover:text-orange-300"
                      >
                        + {workspace.name}
                      </button>
                    ))}
                    {missingLibraryWorkspaces.length === 0 && <span className="text-sm text-neutral-500">All library workspaces are already added.</span>}
                  </div>
                </div>
                <button onClick={addWorkspace} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-700 px-4 py-4 text-sm font-bold text-neutral-300 transition hover:border-orange-500 hover:text-orange-300"><Plus size={17} /> Add custom workspace</button>
              </div>
            </Section>

            <Section icon={ExternalLink} eyebrow="Step 03" title="Select external tools">
              <div className="grid gap-3 md:grid-cols-2">
                {TOOL_OPTIONS.map((tool) => (
                  <button key={tool.key} onClick={() => setTools((prev) => ({ ...prev, [tool.key]: !prev[tool.key] }))} className={`rounded-2xl border p-4 text-left transition ${tools[tool.key] ? "border-orange-500 bg-orange-500/10" : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-600"}`}>
                    <div className="flex items-center justify-between gap-3"><p className="font-semibold text-neutral-100">{tool.label}</p>{tools[tool.key] && <Check className="text-orange-400" size={18} />}</div>
                    <p className="mt-2 text-sm leading-6 text-neutral-500">{tool.description}</p>
                  </button>
                ))}
              </div>
            </Section>

            <Section icon={Download} eyebrow="Step 04" title="Choose export targets">
              <div className="grid gap-3 md:grid-cols-2">
                {EXPORT_TARGETS.map((target) => (
                  <button key={target.key} onClick={() => setExportTargets((prev) => ({ ...prev, [target.key]: !prev[target.key] }))} className={`rounded-2xl border p-4 text-left transition ${exportTargets[target.key] ? "border-orange-500 bg-orange-500/10" : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-600"}`}>
                    <div className="flex items-center justify-between gap-3"><p className="font-semibold text-neutral-100">{target.label}</p>{exportTargets[target.key] && <Check className="text-orange-400" size={18} />}</div>
                    <p className="mt-2 text-sm leading-6 text-neutral-500">{target.description}</p>
                  </button>
                ))}
              </div>
            </Section>

            <Section icon={ShieldCheck} eyebrow="Step 05" title="Backup automation">
              <div className="flex flex-col gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
                <button onClick={() => setBackupEnabled((v) => !v)} className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left ${backupEnabled ? "border-orange-500 bg-orange-500/10" : "border-neutral-800"}`}><span><span className="block font-semibold">Hourly local backup script</span><span className="text-sm text-neutral-500">Generate a safe backup script that excludes secrets and caches.</span></span>{backupEnabled && <Check className="text-orange-400" />}</button>
                <Field label="Retention count" value={String(retention)} onChange={(v) => setRetention(v.replace(/[^0-9]/g, "") || "72")} />
              </div>
            </Section>
          </div>

          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <Section icon={Gauge} eyebrow="Quality" title={`Setup score: ${setupScore.overall}%`}>
              <div className="mb-5 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
                <p className="text-sm font-semibold text-white">Norman UX check</p>
                <div className="mt-3 grid gap-2 text-xs leading-5 text-neutral-400">
                  <p><span className="text-orange-300">Visibility:</span> live brain map and file tree show what will be generated.</p>
                  <p><span className="text-orange-300">Feedback:</span> setup score updates as the form improves.</p>
                  <p><span className="text-orange-300">Constraints:</span> approval gates prevent unsafe agent behavior.</p>
                  <p><span className="text-orange-300">Mapping:</span> roles shape identity, workspaces shape capabilities, tools shape handoffs.</p>
                  <p><span className="text-orange-300">Recovery:</span> generated backups and test prompts help users verify safely.</p>
                </div>
              </div>
              <div className="space-y-3">
                {setupScore.scores.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between text-sm"><span className="text-neutral-300">{item.label}</span><span className="font-semibold text-white">{item.value}%</span></div>
                    <div className="h-2 rounded-full bg-neutral-900"><div className="h-2 rounded-full bg-orange-500" style={{ width: `${item.value}%` }} /></div>
                  </div>
                ))}
              </div>
            </Section>

            <Section icon={GitBranch} eyebrow="System" title="Brain map">
              <BrainMap workspaces={workspaces} />
            </Section>

            <Section icon={FileText} eyebrow="Generated" title="Setup preview">
              <div className="mb-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4"><p className="text-2xl font-black text-white">{Object.keys(files).length}</p><p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Files</p></div>
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4"><p className="text-2xl font-black text-white">{workspaces.length}</p><p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Brains</p></div>
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4"><p className="text-2xl font-black text-white">{Object.values(tools).filter(Boolean).length}</p><p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Tools</p></div>
              </div>
              <div className="max-h-[420px] overflow-auto rounded-2xl border border-neutral-800 bg-black p-4"><pre className="whitespace-pre-wrap text-xs leading-5 text-neutral-300">{soulPreview}</pre></div>
            </Section>

            <Section icon={Sparkles} eyebrow="Validation" title="Test prompts">
              <div className="space-y-3">
                {testPrompts.map((prompt, index) => (
                  <div key={index} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3">
                    <div className="mb-2 flex items-center justify-between"><p className="text-sm font-semibold">Test {index + 1}</p><button onClick={() => copyPrompt(prompt, index)} className="inline-flex items-center gap-1 rounded-xl border border-neutral-800 px-2 py-1 text-xs text-neutral-400 hover:border-orange-500 hover:text-orange-300">{copiedPrompt === index ? <Check size={13} /> : <Copy size={13} />}{copiedPrompt === index ? "Copied" : "Copy"}</button></div>
                    <pre className="whitespace-pre-wrap text-xs leading-5 text-neutral-500">{prompt}</pre>
                  </div>
                ))}
              </div>
            </Section>

            <Section icon={Download} eyebrow="Export" title="Generated file tree">
              <div className="max-h-[360px] overflow-auto rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                {Object.keys(files).map((path) => (<div key={path} className="flex items-center gap-2 border-b border-neutral-900 py-2 text-xs text-neutral-400 last:border-b-0"><ArrowRight size={13} className="text-orange-500" /><span className="font-mono">{path}</span></div>))}
              </div>
              <button onClick={downloadZip} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-black text-black transition hover:bg-orange-200"><Download size={17} /> Download complete setup ZIP</button>
            </Section>
          </div>
        </div>
      </main>
    </div>
  );
}
