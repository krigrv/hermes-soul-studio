export function scoreSetup(config) {
  const filled = (v, min = 4) => Boolean(v && String(v).trim().length > min);

  // 4 identity fields × 25 each, capped at 100
  const identity = Math.min(
    100,
    [config.userName, config.operatorName, config.roles, config.tone].filter((v) => filled(v)).length * 25
  );

  // Breadth: number of workspaces. 4 workspaces = 100.
  const wsCount = config.workspaces.length;
  const workspaces = Math.min(100, wsCount * 25);

  // Per-workspace depth: each workspace contributes equally; full marks if its purpose, tasks and approvals
  // are all substantively filled.
  const workspaceDepth = wsCount === 0
    ? 0
    : Math.round(
        (config.workspaces.reduce((acc, w) => {
          const purpose = filled(w.purpose) ? 1 : 0;
          const tasks = filled(w.tasks) ? 1 : 0;
          const approvals = filled(w.approvals, 15) ? 1 : 0;
          return acc + (purpose + tasks + approvals) / 3;
        }, 0) / wsCount) * 100
      );

  const scores = [
    { label: "Identity", value: identity },
    { label: "Workspaces", value: workspaces },
    { label: "Workspace depth", value: workspaceDepth },
  ];
  const overall = Math.round(scores.reduce((acc, s) => acc + s.value, 0) / scores.length);
  return { overall, scores };
}
