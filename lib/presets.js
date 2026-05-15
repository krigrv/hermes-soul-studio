export const PRESETS = [
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

export const TOOL_OPTIONS = [
  { key: "codex", label: "Codex", description: "Repo debugging, code execution, tests, implementation." },
  { key: "claude", label: "Claude", description: "Critique, writing polish, strategy refinement, second opinion." },
  { key: "googleDrive", label: "Google Drive", description: "External saves and document delivery." },
  { key: "telegram", label: "Telegram", description: "Notifications and delivery alerts." },
  { key: "notion", label: "Notion", description: "Docs, planning, knowledge base." },
  { key: "github", label: "GitHub", description: "Issues, repos, PRs, code history." },
];

export const EXPORT_TARGETS = [
  { key: "hermes", label: "Hermes / Local Agent", description: "Full .agent folder with brains and skills." },
  { key: "codex", label: "Codex Skills", description: "Code handoff and review skill files." },
  { key: "claude", label: "Claude Skills", description: "Claude-friendly critique and refinement handoffs." },
  { key: "cursor", label: "Cursor Rules", description: "A rules file for coding agents and IDE assistants." },
  { key: "chatgpt", label: "ChatGPT Instructions", description: "Copy-ready custom instruction summary." },
];
