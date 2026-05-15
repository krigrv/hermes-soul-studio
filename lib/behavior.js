import { slugify, splitList } from "./utils.js";

const KEYWORDS = {
  coding: ["bug", "repo", "deploy", "code", "build", "debug", "test", "refactor"],
  business: ["client", "proposal", "sales", "pricing", "marketing", "strategy", "operations"],
  design: ["ux", "ui", "wireframe", "critique", "design system", "flow", "microcopy"],
  finance: ["budget", "invoice", "payment", "expense", "pricing", "financial"],
  admin: ["email", "form", "submit", "bank", "insurance", "official", "letter"],
  academics: ["exam", "paper", "syllabus", "assignment", "notes", "research paper"],
  creative: ["poster", "campaign", "moodboard", "lyrics", "creative writing", "image prompt"],
  education: ["curriculum", "lesson", "workshop", "student", "teaching"],
  research: ["synthesis", "market scan", "report", "evidence", "summary"],
  core: ["prioritize", "focus", "plan day", "decide", "goals", "routines"],
};

const RISKY_TOKENS = [
  "send", "publish", "deploy", "delete", "submit", "upload", "buy", "pay", "merge",
];

export function classifyExample(task, config) {
  const lower = task.toLowerCase();
  let bestWorkspace = config.workspaces[0];
  let bestScore = 0;

  for (const w of config.workspaces) {
    const id = slugify(w.name);
    const kw = KEYWORDS[id] || [];
    const fromKeywords = kw.reduce((acc, k) => acc + (lower.includes(k) ? 2 : 0), 0);
    const fromTasks = splitList(w.tasks).reduce(
      (acc, t) => acc + (lower.includes(String(t).toLowerCase()) ? 1 : 0),
      0
    );
    const score = fromKeywords + fromTasks;
    if (score > bestScore) {
      bestScore = score;
      bestWorkspace = w;
    }
  }

  const needsApproval = RISKY_TOKENS.some((t) => lower.includes(t));
  const slug = slugify(bestWorkspace?.name || "core");
  const profile = slugify(config.profileName || "default");

  let engine = "Main operator (native)";
  if (slug === "coding" && config.tools.codex) engine = "Hand off to Codex";
  else if ((slug === "research" || slug === "business") && config.tools.claude)
    engine = "Hand off to Claude for synthesis or critique";

  return {
    workspace: bestWorkspace?.name || "Core",
    brainPath: `.agent/profiles/${profile}/brains/${slug}/`,
    matched: bestScore > 0,
    engine,
    needsApproval,
    nextStep: needsApproval
      ? "Pause and ask for explicit approval before acting."
      : "Draft internally; route to the workspace skill.",
  };
}

export const EXAMPLE_TASKS = [
  "Help me prioritize today",
  "Fix the bug in my login flow and deploy the fix",
  "Draft a proposal for a new client",
  "Send the invoice to the client",
  "Summarize this research paper",
  "Critique the wireframe for the onboarding screen",
];
