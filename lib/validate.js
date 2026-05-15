import { slugify, splitList } from "./utils.js";

const RULES = [
  {
    id: "no-core",
    level: "warn",
    test: (c) => !c.workspaces.some((w) => slugify(w.name) === "core"),
    message: "No Core workspace. The operator usually needs Core for prioritization and decisions.",
  },
  {
    id: "no-workspace",
    level: "error",
    test: (c) => c.workspaces.length === 0,
    message: "No workspaces defined. The operator has nothing to route to.",
  },
  {
    id: "no-roles",
    level: "warn",
    test: (c) => splitList(c.roles).length === 0,
    message: "No roles defined. Add at least one so the operator knows who it serves.",
  },
  {
    id: "coding-no-codex",
    level: "warn",
    test: (c) =>
      c.workspaces.some((w) => slugify(w.name) === "coding") && !c.tools.codex,
    message: "You added Coding but Codex is not enabled. Code tasks will not have a clear handoff.",
  },
  {
    id: "research-no-claude",
    level: "info",
    test: (c) =>
      c.workspaces.some((w) => slugify(w.name) === "research") && !c.tools.claude,
    message: "Research workspace without Claude. Long-form synthesis usually benefits from Claude.",
  },
  {
    id: "high-risk-vague-approvals",
    level: "warn",
    test: (c) =>
      c.workspaces.some(
        (w) =>
          String(w.risk).toLowerCase() === "high" &&
          String(w.approvals || "").trim().length < 20
      ),
    message: "A high-risk workspace has vague approval rules. Spell out what requires approval.",
  },
  {
    id: "exports-no-tools",
    level: "info",
    test: (c) =>
      Object.values(c.exportTargets).some(Boolean) &&
      !Object.values(c.tools).some(Boolean),
    message: "You picked export targets but no external tools. The operator has nowhere to hand off.",
  },
  {
    id: "no-exports",
    level: "warn",
    test: (c) => !Object.values(c.exportTargets).some(Boolean),
    message: "No export targets selected. The generated setup will only target the Hermes default.",
  },
  {
    id: "placeholder-name",
    level: "info",
    test: (c) => /your name/i.test(c.userName || ""),
    message: 'Your name is still a placeholder ("Your Name"). Personalize it before exporting.',
  },
];

export function validateConfig(config) {
  return RULES.filter((r) => {
    try {
      return r.test(config);
    } catch {
      return false;
    }
  }).map((r) => ({ id: r.id, level: r.level, message: r.message }));
}
