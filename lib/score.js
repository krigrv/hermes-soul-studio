export function scoreSetup(config) {
  const scores = [
    {
      label: "Identity",
      value: Math.min(
        100,
        [config.userName, config.operatorName, config.roles, config.tone].filter(
          (v) => v && String(v).trim().length > 4
        ).length * 25
      ),
    },
    {
      label: "Workspaces",
      value: Math.min(
        100,
        config.workspaces.length * 18 + (config.workspaces.length >= 4 ? 20 : 0)
      ),
    },
    {
      label: "Approval Safety",
      value: Math.round(
        config.workspaces.reduce(
          (acc, w) => acc + (String(w.approvals || "").trim().length > 15 ? 1 : 0),
          0
        ) / Math.max(config.workspaces.length, 1) * 100
      ),
    },
    { label: "Tool Routing", value: Math.min(100, Object.values(config.tools).filter(Boolean).length * 18) },
    { label: "Exports", value: Math.min(100, Object.values(config.exportTargets).filter(Boolean).length * 20) },
  ];
  const overall = Math.round(scores.reduce((acc, s) => acc + s.value, 0) / scores.length);
  return { overall, scores };
}
