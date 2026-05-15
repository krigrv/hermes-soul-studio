"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Gauge,
  Layers3,
  Link as LinkIcon,
  Plus,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react";

import { Field } from "../components/Field.jsx";
import { BrainMap } from "../components/BrainMap.jsx";
import { ValidationPanel } from "../components/ValidationPanel.jsx";
import { BehaviorPreview } from "../components/BehaviorPreview.jsx";
import { CheckboxGroup, RiskRadio } from "../components/CheckboxGroup.jsx";

import { WORKSPACE_LIBRARY } from "../lib/workspace-library.js";
import { getOptionsForWorkspace, RISK_OPTIONS } from "../lib/workspace-options.js";
import { TOOL_OPTIONS, EXPORT_TARGETS } from "../lib/presets.js";
import { generateFiles, makeTestPrompts } from "../lib/generators.js";
import { scoreSetup } from "../lib/score.js";
import { validateConfig } from "../lib/validate.js";
import { slugify, splitList } from "../lib/utils.js";
import {
  loadConfig,
  saveConfig,
  encodeShareHash,
  decodeShareHash,
} from "../lib/storage.js";

const DEFAULT_CONFIG = {
  userName: "Your Name",
  operatorName: "Hermes",
  companyName: "Your Company",
  profileName: "default",
  roles: "Founder, Designer, Developer, Operator",
  tone: "Direct, practical, sharp, structured, lightly witty when useful.",
  avoid: "generic advice, corporate fluff, unnecessary questions, fake certainty",
  workspaces: [
    WORKSPACE_LIBRARY.core,
    WORKSPACE_LIBRARY.business,
    WORKSPACE_LIBRARY.coding,
    WORKSPACE_LIBRARY.creative,
  ],
  tools: { codex: true, claude: true, googleDrive: false, telegram: false, notion: false, github: true },
  exportTargets: { hermes: true, codex: true, claude: true, cursor: true, chatgpt: true },
  backupEnabled: true,
  retention: 72,
};

const STEPS = [
  { id: "you", label: "About you", description: "Who you are and how the AI should sound." },
  { id: "workspaces", label: "Your work", description: "What areas the AI helps with, and where it should pause." },
  { id: "tools", label: "Other tools", description: "Apps the AI can hand work off to." },
  { id: "targets", label: "Where to use it", description: "Which apps get a custom instructions file." },
  { id: "backup", label: "Backup", description: "Optional. Auto-save your AI setup hourly." },
  { id: "review", label: "Review & download", description: "Grab the ZIP." },
];

function ensureIds(workspaces) {
  return workspaces.map((w, i) => ({
    ...w,
    id: w.id || `${slugify(w.name)}-${i}-${Date.now()}`,
  }));
}

function mergeConfig(base, incoming) {
  if (!incoming || typeof incoming !== "object") return base;
  return {
    ...base,
    ...incoming,
    tools: { ...base.tools, ...(incoming.tools || {}) },
    exportTargets: { ...base.exportTargets, ...(incoming.exportTargets || {}) },
    workspaces: Array.isArray(incoming.workspaces) && incoming.workspaces.length
      ? ensureIds(incoming.workspaces)
      : base.workspaces,
    retention: Number(incoming.retention) > 0 ? Number(incoming.retention) : base.retention,
  };
}

export default function HermesSoulStudio() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(0);
  const [newRole, setNewRole] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState(0);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [showFiles, setShowFiles] = useState(false);
  const undoTimerRef = useRef(null);

  useEffect(() => {
    let next = null;
    if (typeof window !== "undefined" && window.location.hash.startsWith("#c=")) {
      next = decodeShareHash(window.location.hash.slice(3));
      if (next) history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    if (!next) next = loadConfig();
    if (next) setConfig((prev) => mergeConfig(prev, next));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveConfig(config);
  }, [config, hydrated]);

  useEffect(() => () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    if (activeWorkspace >= config.workspaces.length) {
      setActiveWorkspace(Math.max(0, config.workspaces.length - 1));
    }
  }, [config.workspaces.length, activeWorkspace]);

  const setField = useCallback((key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const files = useMemo(() => generateFiles(config), [config]);
  const profileSlug = slugify(config.profileName);
  const soulPreview = files[`.agent/profiles/${profileSlug}/SOUL.md`];
  const testPrompts = useMemo(() => makeTestPrompts(config.workspaces), [config.workspaces]);
  const setupScore = useMemo(() => scoreSetup(config), [config]);
  const validation = useMemo(() => validateConfig(config), [config]);
  const roleList = useMemo(() => splitList(config.roles), [config.roles]);
  const missingLibraryWorkspaces = Object.values(WORKSPACE_LIBRARY).filter(
    (item) => !config.workspaces.some((workspace) => slugify(workspace.name) === slugify(item.name))
  );

  const addWorkspace = () => {
    setConfig((prev) => ({
      ...prev,
      workspaces: [
        ...prev.workspaces,
        {
          id: crypto.randomUUID?.() || String(Date.now()),
          name: "New Workspace",
          purpose: "",
          tasks: "",
          risk: "Medium",
          approvals: "",
        },
      ],
    }));
    setActiveWorkspace(config.workspaces.length);
  };

  const addWorkspaceFromLibrary = (workspace) => {
    setConfig((prev) => ({
      ...prev,
      workspaces: [...prev.workspaces, { ...workspace, id: `${workspace.id}-${Date.now()}` }],
    }));
    setActiveWorkspace(config.workspaces.length);
  };

  const addRole = () => {
    const value = newRole.trim();
    if (!value) return;
    const existing = splitList(config.roles).map((item) => item.toLowerCase());
    if (existing.includes(value.toLowerCase())) {
      setNewRole("");
      return;
    }
    setField("roles", [...splitList(config.roles), value].join(", "));
    setNewRole("");
  };

  const removeRole = (role) =>
    setField("roles", splitList(config.roles).filter((item) => item !== role).join(", "));

  const updateWorkspace = (index, key, value) =>
    setConfig((prev) => ({
      ...prev,
      workspaces: prev.workspaces.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    }));

  const deleteWorkspace = (index) => {
    const workspace = config.workspaces[index];
    if (!workspace) return;
    setConfig((prev) => ({ ...prev, workspaces: prev.workspaces.filter((_, i) => i !== index) }));
    setPendingDelete({ workspace, index });
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setPendingDelete(null), 6000);
  };

  const undoDelete = () => {
    if (!pendingDelete) return;
    const { workspace, index } = pendingDelete;
    setConfig((prev) => {
      const next = [...prev.workspaces];
      next.splice(Math.min(index, next.length), 0, workspace);
      return { ...prev, workspaces: next };
    });
    setPendingDelete(null);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    Object.entries(files).forEach(([path, content]) => zip.file(path, content));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hermes-soul-studio-${slugify(config.operatorName)}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 4000);
  };

  const copyShareLink = async () => {
    if (typeof window === "undefined") return;
    const hash = encodeShareHash(config);
    const url = `${window.location.origin}${window.location.pathname}#c=${hash}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1600);
    } catch {/* clipboard blocked */}
  };

  const copyPrompt = async (prompt, index) => {
    await navigator.clipboard.writeText(prompt);
    setCopiedPrompt(index);
    setTimeout(() => setCopiedPrompt(null), 1600);
  };

  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;
  const current = STEPS[step];
  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="min-h-screen bg-[#090909] text-neutral-100">
      <div className="pointer-events-none fixed inset-0 opacity-25" aria-hidden="true">
        <div className="absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-orange-600 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-80 w-80 rounded-full bg-purple-700 blur-[140px]" />
      </div>

      {pendingDelete && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm shadow-2xl shadow-black/50">
          Removed <span className="font-semibold">{pendingDelete.workspace.name}</span>
          <button
            onClick={undoDelete}
            className="inline-flex items-center gap-1 rounded-lg border border-orange-500/40 bg-orange-500/10 px-2 py-1 text-xs font-bold text-orange-200"
          >
            <Undo2 size={12} /> Undo
          </button>
        </div>
      )}

      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-neutral-900 bg-[#090909]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-600 text-white">
              <Sparkles size={14} />
            </div>
            <p className="text-sm font-bold text-white">Hermes Soul Studio</p>
          </div>

          <div className="hidden flex-1 md:block">
            <div className="flex items-center gap-1">
              {STEPS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setStep(i)}
                  className="group flex flex-1 items-center gap-2"
                  title={s.label}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition ${
                      i === step
                        ? "bg-orange-500 text-white"
                        : i < step
                          ? "bg-orange-500/20 text-orange-300"
                          : "bg-neutral-900 text-neutral-500"
                    }`}
                  >
                    {i < step ? <Check size={11} /> : i + 1}
                  </span>
                  <span
                    className={`hidden text-xs font-semibold transition lg:inline ${
                      i === step ? "text-white" : "text-neutral-500 group-hover:text-neutral-300"
                    }`}
                  >
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && <span className="flex-1 border-t border-neutral-800" />}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={copyShareLink}
            className="hidden items-center gap-1.5 rounded-lg border border-neutral-800 px-2.5 py-1.5 text-xs font-semibold text-neutral-300 transition hover:border-neutral-600 md:inline-flex"
          >
            {shareCopied ? <Check size={12} /> : <LinkIcon size={12} />}
            {shareCopied ? "Copied" : "Share"}
          </button>
        </div>
        {/* mobile progress bar */}
        <div className="h-0.5 bg-neutral-900 md:hidden">
          <div className="h-full bg-orange-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <main className="relative mx-auto grid max-w-6xl gap-5 px-4 py-6 md:grid-cols-[1fr_240px] md:px-6 md:py-8">
        <div className="min-w-0">
          <header className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300">
              Step {step + 1} of {STEPS.length}
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-white md:text-3xl">{current.label}</h1>
            <p className="mt-1 text-sm leading-6 text-neutral-400">{current.description}</p>
          </header>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-5 shadow-xl shadow-black/20">
            {current.id === "you" && (
              <StepYou
                config={config}
                setField={setField}
                roleList={roleList}
                newRole={newRole}
                setNewRole={setNewRole}
                addRole={addRole}
                removeRole={removeRole}
              />
            )}
            {current.id === "workspaces" && (
              <StepWorkspaces
                config={config}
                activeWorkspace={activeWorkspace}
                setActiveWorkspace={setActiveWorkspace}
                updateWorkspace={updateWorkspace}
                deleteWorkspace={deleteWorkspace}
                addWorkspace={addWorkspace}
                addWorkspaceFromLibrary={addWorkspaceFromLibrary}
                missingLibraryWorkspaces={missingLibraryWorkspaces}
              />
            )}
            {current.id === "tools" && <StepTools config={config} setConfig={setConfig} />}
            {current.id === "targets" && <StepTargets config={config} setConfig={setConfig} />}
            {current.id === "backup" && <StepBackup config={config} setField={setField} />}
            {current.id === "review" && (
              <StepReview
                config={config}
                files={files}
                soulPreview={soulPreview}
                testPrompts={testPrompts}
                validation={validation}
                copyPrompt={copyPrompt}
                copiedPrompt={copiedPrompt}
                downloadZip={downloadZip}
                downloaded={downloaded}
                showFiles={showFiles}
                setShowFiles={setShowFiles}
              />
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              onClick={back}
              disabled={isFirst}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:border-neutral-600 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowLeft size={14} /> Back
            </button>
            {isLast ? (
              <button
                onClick={downloadZip}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500"
              >
                <Download size={14} /> Download ({Object.keys(files).length} files)
              </button>
            ) : (
              <button
                onClick={next}
                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500"
              >
                Next <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Sticky summary */}
        <aside className="md:sticky md:top-20 md:self-start">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
              <Gauge size={11} className="text-orange-400" /> Progress
            </div>
            <p className="text-2xl font-black text-white">{setupScore.overall}%</p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-neutral-900">
              <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${setupScore.overall}%` }} />
            </div>

            <div className="mt-4 space-y-1.5 text-xs">
              <Stat label="Workspaces" value={config.workspaces.length} />
              <Stat label="Tools on" value={Object.values(config.tools).filter(Boolean).length} />
              <Stat label="Exports" value={Object.values(config.exportTargets).filter(Boolean).length} />
              <Stat label="Files to make" value={Object.keys(files).length} highlight />
            </div>

            {validation.length > 0 && (
              <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2 text-[11px] leading-4 text-amber-200">
                {validation.length} thing{validation.length > 1 ? "s" : ""} to check on review.
              </div>
            )}

            {!isLast && (
              <button
                onClick={downloadZip}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-2 text-xs font-bold text-neutral-200 transition hover:border-orange-500 hover:text-orange-300"
              >
                <Download size={12} /> Download now
              </button>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-neutral-500">{label}</span>
      <span className={`font-bold ${highlight ? "text-orange-300" : "text-white"}`}>{value}</span>
    </div>
  );
}

/* ---------- STEPS ---------- */

function StepYou({ config, setField, roleList, newRole, setNewRole, addRole, removeRole }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Your name" value={config.userName} onChange={(v) => setField("userName", v)} placeholder="e.g. Krishna" />
        <Field label="Name for the AI" value={config.operatorName} onChange={(v) => setField("operatorName", v)} placeholder="e.g. Hermes" />
        <Field label="Company / team (optional)" value={config.companyName} onChange={(v) => setField("companyName", v)} />
        <Field label="Profile name" value={config.profileName} onChange={(v) => setField("profileName", v)} placeholder="default" />
      </div>

      <div>
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">What hats do you wear?</span>
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-2.5">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {roleList.map((role) => (
              <button
                key={role}
                onClick={() => removeRole(role)}
                className="rounded-full border border-orange-500/40 bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-200 transition hover:border-red-500 hover:text-red-200"
              >
                {role} ×
              </button>
            ))}
            {roleList.length === 0 && <p className="text-xs text-neutral-500">Add at least one role.</p>}
          </div>
          <div className="flex gap-2">
            <input
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); addRole(); }
              }}
              placeholder="e.g. Founder, Lawyer, Teacher"
              className="min-w-0 flex-1 rounded-lg border border-neutral-800 bg-black px-2.5 py-1.5 text-xs text-neutral-100 outline-none focus:border-orange-500"
            />
            <button onClick={addRole} className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-500">
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="How should it sound?" value={config.tone} onChange={(v) => setField("tone", v)} textarea placeholder="e.g. Direct, practical, no fluff." />
        <Field label="What should it never do?" value={config.avoid} onChange={(v) => setField("avoid", v)} textarea placeholder="e.g. generic advice, fake certainty" />
      </div>
    </div>
  );
}

function StepWorkspaces({
  config,
  activeWorkspace,
  setActiveWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addWorkspace,
  addWorkspaceFromLibrary,
  missingLibraryWorkspaces,
}) {
  const ws = config.workspaces[activeWorkspace];
  const options = ws ? getOptionsForWorkspace(slugify(ws.name)) : null;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {config.workspaces.map((w, i) => (
          <button
            key={w.id}
            onClick={() => setActiveWorkspace(i)}
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
              i === activeWorkspace
                ? "border-orange-500 bg-orange-500/15 text-orange-100"
                : "border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-600"
            }`}
          >
            {w.name || `Workspace ${i + 1}`}
          </button>
        ))}
        {missingLibraryWorkspaces.length > 0 && (
          <div className="ml-1 flex flex-wrap gap-1.5 border-l border-neutral-800 pl-2">
            {missingLibraryWorkspaces.slice(0, 6).map((w) => (
              <button
                key={w.id}
                onClick={() => addWorkspaceFromLibrary(w)}
                className="rounded-lg border border-dashed border-neutral-700 px-2 py-1 text-[11px] font-semibold text-neutral-400 hover:border-orange-500 hover:text-orange-300"
                title={`Add ${w.name}`}
              >
                + {w.name}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={addWorkspace}
          className="rounded-lg border border-dashed border-neutral-700 px-2 py-1 text-[11px] font-semibold text-neutral-400 hover:border-orange-500 hover:text-orange-300"
        >
          <Plus size={11} className="inline" /> Blank
        </button>
      </div>

      {ws ? (
        <div className="grid gap-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Field
                label="Workspace name"
                value={ws.name}
                onChange={(v) => updateWorkspace(activeWorkspace, "name", v)}
                placeholder="e.g. Business, Coding, Admin"
              />
            </div>
            <button
              onClick={() => deleteWorkspace(activeWorkspace)}
              className="mb-0.5 rounded-lg border border-neutral-800 p-2 text-neutral-500 transition hover:border-red-500 hover:text-red-400"
              aria-label="Remove workspace"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <p className="-mt-2 text-[11px] leading-4 text-neutral-500">
            Known names get smart suggestions: Core, Business, Coding, Design, Education, Admin, Academics, Creative, Finance, Research.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <CheckboxGroup
              label="What is this for?"
              options={options.purpose}
              value={ws.purpose}
              onChange={(v) => updateWorkspace(activeWorkspace, "purpose", v)}
            />
            <CheckboxGroup
              label="What tasks happen here?"
              options={options.tasks}
              value={ws.tasks}
              onChange={(v) => updateWorkspace(activeWorkspace, "tasks", v)}
            />
          </div>

          <RiskRadio
            value={ws.risk}
            onChange={(v) => updateWorkspace(activeWorkspace, "risk", v)}
            options={RISK_OPTIONS}
          />

          <CheckboxGroup
            label="The AI must ask before…"
            hint="Anything ticked here pauses for your approval."
            options={options.approvals}
            value={ws.approvals}
            onChange={(v) => updateWorkspace(activeWorkspace, "approvals", v)}
          />
        </div>
      ) : (
        <p className="text-sm text-neutral-500">Add a workspace above to get started.</p>
      )}
    </div>
  );
}

function StepTools({ config, setConfig }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {TOOL_OPTIONS.map((tool) => (
        <button
          key={tool.key}
          onClick={() =>
            setConfig((prev) => ({ ...prev, tools: { ...prev.tools, [tool.key]: !prev.tools[tool.key] } }))
          }
          aria-pressed={!!config.tools[tool.key]}
          className={`rounded-xl border p-3 text-left transition ${
            config.tools[tool.key]
              ? "border-orange-500 bg-orange-500/10"
              : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-600"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-neutral-100">{tool.label}</p>
            {config.tools[tool.key] && <Check className="text-orange-400" size={14} />}
          </div>
          <p className="mt-1 text-xs leading-5 text-neutral-500">{tool.description}</p>
        </button>
      ))}
    </div>
  );
}

function StepTargets({ config, setConfig }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {EXPORT_TARGETS.map((target) => (
        <button
          key={target.key}
          onClick={() =>
            setConfig((prev) => ({ ...prev, exportTargets: { ...prev.exportTargets, [target.key]: !prev.exportTargets[target.key] } }))
          }
          aria-pressed={!!config.exportTargets[target.key]}
          className={`rounded-xl border p-3 text-left transition ${
            config.exportTargets[target.key]
              ? "border-orange-500 bg-orange-500/10"
              : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-600"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-neutral-100">{target.label}</p>
            {config.exportTargets[target.key] && <Check className="text-orange-400" size={14} />}
          </div>
          <p className="mt-1 text-xs leading-5 text-neutral-500">{target.description}</p>
        </button>
      ))}
    </div>
  );
}

function StepBackup({ config, setField }) {
  return (
    <div className="grid gap-3 md:grid-cols-[1fr_180px]">
      <button
        onClick={() => setField("backupEnabled", !config.backupEnabled)}
        aria-pressed={config.backupEnabled}
        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left ${
          config.backupEnabled ? "border-orange-500 bg-orange-500/10" : "border-neutral-800"
        }`}
      >
        <span>
          <span className="block text-sm font-semibold">Back up every hour</span>
          <span className="text-xs text-neutral-500">Skips secrets and caches. Local only.</span>
        </span>
        {config.backupEnabled && <Check className="text-orange-400" size={16} />}
      </button>
      {config.backupEnabled && (
        <Field
          label="Copies to keep"
          type="number"
          value={String(config.retention)}
          onChange={(v) => {
            const n = parseInt(String(v).replace(/[^0-9]/g, ""), 10);
            setField("retention", Number.isFinite(n) && n > 0 ? n : 1);
          }}
        />
      )}
    </div>
  );
}

function StepReview({
  config,
  files,
  soulPreview,
  testPrompts,
  validation,
  copyPrompt,
  copiedPrompt,
  downloadZip,
  downloaded,
  showFiles,
  setShowFiles,
}) {
  const fileCount = Object.keys(files).length;
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-orange-200">Ready. {fileCount} files for {config.operatorName}.</p>
            <p className="mt-0.5 text-xs text-orange-100/70">
              The ZIP contains a <code className="rounded bg-black/40 px-1">.agent</code> folder, an <code className="rounded bg-black/40 px-1">exports/</code> folder, and README.md.
            </p>
          </div>
          <button
            onClick={downloadZip}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-black transition hover:bg-orange-200"
          >
            {downloaded ? <Check size={14} /> : <Download size={14} />}
            {downloaded ? "Downloaded" : "Download ZIP"}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-orange-100/60">
          On macOS, dot-folders (like <code>.agent</code>) are hidden by default. Press <kbd className="rounded bg-black/40 px-1">Cmd ⇧ .</kbd> in Finder to show them.
        </p>
      </div>

      {validation.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Heads up</p>
          <ValidationPanel issues={validation} />
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">How the AI will behave</p>
          <BehaviorPreview config={config} />
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Workspaces</p>
          <BrainMap workspaces={config.workspaces} />
        </div>
      </div>

      <details className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Test prompts ({testPrompts.length})
        </summary>
        <div className="mt-3 space-y-2">
          {testPrompts.map((prompt, index) => (
            <div key={index} className="rounded-lg border border-neutral-800 bg-black/40 p-2.5">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-semibold">Test {index + 1}</p>
                <button
                  onClick={() => copyPrompt(prompt, index)}
                  className="inline-flex items-center gap-1 rounded border border-neutral-800 px-1.5 py-0.5 text-[11px] text-neutral-400 hover:border-orange-500 hover:text-orange-300"
                >
                  {copiedPrompt === index ? <Check size={11} /> : <Copy size={11} />}
                  {copiedPrompt === index ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-[11px] leading-4 text-neutral-500">{prompt}</pre>
            </div>
          ))}
        </div>
      </details>

      <details className="rounded-xl border border-neutral-800 bg-neutral-950 p-3" onToggle={(e) => setShowFiles(e.currentTarget.open)}>
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
          {showFiles ? "Hide" : "Show"} all {fileCount} files
        </summary>
        <div className="mt-2 max-h-56 overflow-auto font-mono text-[11px] leading-5 text-neutral-400">
          {Object.keys(files).map((path) => (
            <div key={path} className="flex items-center gap-1.5 py-0.5">
              <FileText size={10} className="text-orange-500" /> {path}
            </div>
          ))}
        </div>
      </details>

      <details className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
          <Eye size={11} className="mr-1 inline" /> Preview SOUL.md
        </summary>
        <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap text-[11px] leading-4 text-neutral-400">{soulPreview}</pre>
      </details>
    </div>
  );
}
