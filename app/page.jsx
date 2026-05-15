"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Download,
  Eye,
  FileText,
  Gauge,
  Heart,
  Layers3,
  Link as LinkIcon,
  Moon,
  Plus,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  Undo2,
  Wand2,
  X,
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

const GITHUB_URL = "https://github.com/krigrv/hermes-soul-studio";
const UPI_ID = "krigrv@upi";
const UPI_QR = "/qr.png";

function Github({ size = 14 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5a11.5 11.5 0 0 0-3.63 22.42c.57.1.78-.25.78-.55v-2.06c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.74 1.27 3.41.97.1-.76.4-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.1-.12-.3-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.06.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.35.77 1.05.77 2.12v3.14c0 .3.21.66.79.55A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

function HermesMark({ size = 28 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="12" fill="#0a0a0a" />
      <g fill="url(#hm)">
        <rect x="12" y="12" width="10" height="40" />
        <rect x="42" y="12" width="10" height="40" />
        <rect x="22" y="28" width="20" height="8" />
      </g>
    </svg>
  );
}

const DEFAULT_CONFIG = {
  userName: "",
  operatorName: "Hermes",
  companyName: "",
  profileName: "default",
  roles: "",
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
  { id: "you", label: "About you", description: "Who you are and how Hermes should sound." },
  { id: "workspaces", label: "Your work", description: "What areas Hermes covers, and where it should pause for approval." },
  { id: "tools", label: "Other tools", description: "Apps Hermes can hand work off to." },
  { id: "targets", label: "Companion files", description: "Optional bridge files for the apps Hermes works with." },
  { id: "backup", label: "Backup", description: "Optional. Auto-save the Hermes setup hourly." },
  { id: "review", label: "Review & download", description: "Grab the ZIP that holds Hermes." },
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

function useTheme() {
  // returns [isDark, toggle]
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggle = useCallback(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    setIsDark(next);
  }, []);
  return [isDark, toggle];
}

export default function HermesSoulStudio() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [hydrated, setHydrated] = useState(false);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [newRole, setNewRole] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState(0);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [showFiles, setShowFiles] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const [isDark, toggleTheme] = useTheme();
  const undoTimerRef = useRef(null);

  useEffect(() => {
    let next = null;
    let cameFromHash = false;
    if (typeof window !== "undefined" && window.location.hash.startsWith("#c=")) {
      next = decodeShareHash(window.location.hash.slice(3));
      if (next) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
        cameFromHash = true;
      }
    }
    if (!next) next = loadConfig();
    if (next) setConfig((prev) => mergeConfig(prev, next));
    try {
      if (cameFromHash || localStorage.getItem("introSeen") === "1") setStarted(true);
    } catch {}
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

  const beginWizard = () => {
    try { localStorage.setItem("introSeen", "1"); } catch {}
    setStarted(true);
  };

  const backToIntro = () => {
    try { localStorage.removeItem("introSeen"); } catch {}
    setStarted(false);
  };

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

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 transition-colors dark:bg-[#090909] dark:text-neutral-100">
      <div className="pointer-events-none fixed inset-0 opacity-20 dark:opacity-25" aria-hidden="true">
        <div className="absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-amber-500 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-80 w-80 rounded-full bg-purple-500 blur-[140px]" />
      </div>

      <TopBar
        started={started}
        backToIntro={backToIntro}
        copyShareLink={copyShareLink}
        shareCopied={shareCopied}
        isDark={isDark}
        toggleTheme={toggleTheme}
        openDonate={() => setDonateOpen(true)}
      />
      {started && <StepBar step={step} setStep={setStep} />}

      {!started ? (
        <Intro onStart={beginWizard} openDonate={() => setDonateOpen(true)} />
      ) : (
        <Wizard
          config={config}
          setConfig={setConfig}
          step={step}
          setStep={setStep}
          files={files}
          soulPreview={soulPreview}
          testPrompts={testPrompts}
          setupScore={setupScore}
          validation={validation}
          roleList={roleList}
          newRole={newRole}
          setNewRole={setNewRole}
          addRole={addRole}
          removeRole={removeRole}
          activeWorkspace={activeWorkspace}
          setActiveWorkspace={setActiveWorkspace}
          updateWorkspace={updateWorkspace}
          deleteWorkspace={deleteWorkspace}
          addWorkspace={addWorkspace}
          addWorkspaceFromLibrary={addWorkspaceFromLibrary}
          missingLibraryWorkspaces={missingLibraryWorkspaces}
          downloadZip={downloadZip}
          downloaded={downloaded}
          copyPrompt={copyPrompt}
          copiedPrompt={copiedPrompt}
          showFiles={showFiles}
          setShowFiles={setShowFiles}
          setField={setField}
        />
      )}

      {donateOpen && <DonateModal onClose={() => setDonateOpen(false)} />}

      {pendingDelete && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-900 shadow-2xl shadow-black/10 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:shadow-black/50">
          Removed <span className="font-semibold">{pendingDelete.workspace.name}</span>
          <button
            onClick={undoDelete}
            className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-700 dark:text-amber-200"
          >
            <Undo2 size={12} /> Undo
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Top bar ---------- */

function TopBar({ started, backToIntro, copyShareLink, shareCopied, isDark, toggleTheme, openDonate }) {
  return (
    <div className="sticky top-0 z-40 border-b border-neutral-200 bg-neutral-50/85 backdrop-blur dark:border-neutral-900 dark:bg-[#090909]/90">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-6">
        <button onClick={backToIntro} className="flex items-center gap-2" title="Back to intro">
          <HermesMark size={28} />
          <p className="text-sm font-bold text-neutral-900 dark:text-white">Hermes Soul Studio</p>
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5">
          {started && (
            <button
              onClick={copyShareLink}
              className="hidden items-center gap-1.5 rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-neutral-500 dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 sm:inline-flex"
              title="Copy share link"
            >
              {shareCopied ? <Check size={12} /> : <LinkIcon size={12} />}
              {shareCopied ? "Copied" : "Share"}
            </button>
          )}
          <button
            onClick={openDonate}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition hover:border-amber-500 dark:text-amber-300"
            title="Donate"
          >
            <Heart size={12} />
            <span className="hidden sm:inline">Donate</span>
          </button>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-neutral-500 dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600"
            title="View on GitHub"
          >
            <Github size={12} />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <button
            onClick={toggleTheme}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-300 text-neutral-700 transition hover:border-neutral-500 dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600"
            title={isDark ? "Switch to light" : "Switch to dark"}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={13} /> : <Moon size={13} />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Donate ---------- */

function DonateModal({ onClose }) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {/* ignore */}
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
          <Heart size={12} /> Found this useful?
        </div>
        <h2 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
          Buy me a chai
        </h2>
        <p className="mt-1 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
          Hermes Soul Studio is free and open source. If it saved you time, a small tip keeps it that way.
        </p>

        <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-black/40">
          {imgError ? (
            <div className="flex h-48 w-48 items-center justify-center rounded-xl border border-dashed border-neutral-300 text-xs text-neutral-500 dark:border-neutral-700">
              QR not found at /qr.png
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={UPI_QR}
              alt="UPI QR code"
              width={208}
              height={208}
              onError={() => setImgError(true)}
              className="h-52 w-52 rounded-xl bg-white object-contain p-2"
            />
          )}
          <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">Scan with any UPI app</p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900/50">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">UPI ID</p>
            <p className="truncate text-sm font-mono text-neutral-900 dark:text-white">{UPI_ID}</p>
          </div>
          <button
            onClick={copyUpi}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-amber-500 hover:text-amber-600 dark:border-neutral-700 dark:text-neutral-200 dark:hover:text-amber-300"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] text-neutral-500">
          Thank you 🧡
        </p>
      </div>
    </div>
  );
}

/* ---------- Step bar ---------- */

function StepBar({ step, setStep }) {
  const progress = Math.round(((step + 1) / STEPS.length) * 100);
  const current = STEPS[step];
  return (
    <div className="border-b border-neutral-200 bg-white/70 backdrop-blur dark:border-neutral-900 dark:bg-neutral-950/40">
      <div className="mx-auto max-w-6xl px-4 pt-3 md:px-6">
        {/* Compact view on mobile */}
        <div className="flex items-center justify-between gap-3 sm:hidden">
          <p className="text-xs font-semibold text-neutral-900 dark:text-white">{current.label}</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
            Step {step + 1} / {STEPS.length}
          </p>
        </div>
        {/* Full stepper on sm+ */}
        <div className="hidden items-center gap-2 sm:flex">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(i)}
              className="group flex flex-1 items-center gap-2"
              title={s.label}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition ${
                  i === step
                    ? "bg-amber-500 text-white"
                    : i < step
                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                      : "bg-neutral-200 text-neutral-500 dark:bg-neutral-900"
                }`}
              >
                {i < step ? <Check size={11} /> : i + 1}
              </span>
              <span
                className={`hidden truncate text-xs font-semibold transition lg:inline ${
                  i === step
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300"
                }`}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
              )}
            </button>
          ))}
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-900 sm:mt-3">
          <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-1.5 hidden pb-3 text-[10px] uppercase tracking-[0.22em] text-neutral-500 sm:block">
          Step {step + 1} of {STEPS.length} · {progress}%
        </p>
        <div className="pb-3 sm:hidden" />
      </div>
    </div>
  );
}

/* ---------- Intro ---------- */

function Intro({ onStart, openDonate }) {
  return (
    <main className="relative mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
      <div className="grid gap-5 md:grid-cols-2 md:gap-6 lg:gap-8">
        {/* LEFT — Hero + value cards */}
        <div className="space-y-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
              <Sparkles size={11} /> Local-first operator setup · 5 steps
            </div>
            <h1 className="text-2xl font-black tracking-tight text-neutral-900 sm:text-3xl md:text-4xl lg:text-5xl dark:text-white">
              Build the OS for <span className="text-amber-500 dark:text-amber-400">your AI operator.</span>
            </h1>
            <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400 md:text-[15px] md:leading-7">
              Hermes Soul Studio generates a complete operator setup — soul, workspace brains, repeatable skills, tool handoffs, approval gates, exports, and local backups. Five short steps. Everything stays on your machine.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition hover:bg-amber-500"
            >
              Get started <ArrowRight size={14} />
            </button>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-500 dark:border-neutral-800 dark:text-neutral-200 dark:hover:border-neutral-600"
            >
              <Github size={14} /> GitHub
            </a>
          </div>

          <div className="grid gap-2 pt-1">
            <CompactCard icon={Wand2} title="Soul" body="Identity, voice, who he serves, what he must never do." />
            <CompactCard icon={Layers3} title="Brains & skills" body="Workspace knowledge plus repeatable workflows for each area." />
            <CompactCard icon={ShieldCheck} title="Conscience" body="Approval gates, tool handoffs, recovery + hourly local backups." />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-neutral-500">
            <span className="inline-flex items-center gap-1"><Check size={11} className="text-amber-500" /> No accounts</span>
            <span className="inline-flex items-center gap-1"><Check size={11} className="text-amber-500" /> Live preview</span>
            <span className="inline-flex items-center gap-1"><Check size={11} className="text-amber-500" /> Shareable URL</span>
            <span className="inline-flex items-center gap-1"><Check size={11} className="text-amber-500" /> Open source (MIT)</span>
          </div>
        </div>

        {/* RIGHT — Run locally + Donate */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950/70">
            <div className="flex items-center gap-2">
              <Github size={13} />
              <p className="text-sm font-bold text-neutral-900 dark:text-white">Prefer to run it locally?</p>
            </div>
            <p className="mt-1.5 text-xs leading-5 text-neutral-600 dark:text-neutral-400">
              Clone into a hidden <code className="rounded bg-neutral-100 px-1 dark:bg-black/40">~/.hermes</code> folder.
            </p>
            <pre className="mt-2.5 overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 text-[11px] leading-5 text-neutral-800 dark:border-neutral-800 dark:bg-black/40 dark:text-neutral-200">
{`mkdir -p ~/.hermes && cd ~/.hermes
git clone ${GITHUB_URL}.git
cd hermes-soul-studio
npm install && npm run dev`}
            </pre>
            <details className="mt-2.5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5 text-[11px] leading-5 text-amber-800 dark:text-amber-200">
              <summary className="cursor-pointer font-semibold">
                The folder is hidden — how to view it
              </summary>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-amber-700/90 dark:text-amber-100/80">
                <li><strong>Finder (macOS):</strong> press <kbd className="rounded bg-black/10 px-1 dark:bg-black/40">Cmd ⇧ .</kbd></li>
                <li><strong>Terminal:</strong> <code>ls -la ~</code> · <code>cd ~/.hermes</code></li>
                <li><strong>VS Code:</strong> File → Open → <kbd className="rounded bg-black/10 px-1 dark:bg-black/40">Cmd ⇧ .</kbd></li>
                <li><strong>Windows / WSL:</strong> Explorer → View → tick &quot;Hidden items&quot;</li>
              </ul>
            </details>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-300">
              <Heart size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-neutral-900 dark:text-white">Found this useful?</p>
              <p className="truncate text-xs text-neutral-600 dark:text-neutral-400">
                Tips keep it free and open source.
              </p>
            </div>
            <button
              onClick={openDonate}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-amber-500"
            >
              <Heart size={12} /> Donate
            </button>
          </div>

          <p className="text-center text-[11px] text-neutral-500">
            Made by <a href="https://github.com/krigrv" target="_blank" rel="noreferrer" className="underline hover:text-amber-500">Krishna Gaurav</a>
            {" · "}
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="underline hover:text-amber-500">Source on GitHub</a>
          </p>
        </div>
      </div>
    </main>
  );
}

function CompactCard({ icon: Icon, title, body }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950/70">
      <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-300">
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-neutral-900 dark:text-white">{title}</p>
        <p className="text-xs leading-5 text-neutral-600 dark:text-neutral-400">{body}</p>
      </div>
    </div>
  );
}

/* ---------- Wizard ---------- */

function Wizard({
  config,
  setConfig,
  step,
  setStep,
  files,
  soulPreview,
  testPrompts,
  setupScore,
  validation,
  roleList,
  newRole,
  setNewRole,
  addRole,
  removeRole,
  activeWorkspace,
  setActiveWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addWorkspace,
  addWorkspaceFromLibrary,
  missingLibraryWorkspaces,
  downloadZip,
  downloaded,
  copyPrompt,
  copiedPrompt,
  showFiles,
  setShowFiles,
  setField,
}) {
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;
  const current = STEPS[step];
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <main className="relative mx-auto grid max-w-6xl gap-5 px-4 py-6 md:grid-cols-[1fr_240px] md:px-6 md:py-8">
        <div className="min-w-0">
          <header className="mb-4">
            <h1 className="text-2xl font-black tracking-tight text-neutral-900 md:text-3xl dark:text-white">
              {current.label}
            </h1>
            <p className="mt-1 text-sm leading-6 text-neutral-600 dark:text-neutral-400">{current.description}</p>
          </header>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm shadow-black/5 dark:border-neutral-800 dark:bg-neutral-950/70 dark:shadow-black/20 sm:p-5">
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
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-30 dark:border-neutral-800 dark:text-neutral-200 dark:hover:border-neutral-600"
            >
              <ArrowLeft size={14} /> Back
            </button>
            {isLast ? (
              <button
                onClick={downloadZip}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-amber-500"
              >
                <Download size={14} /> Download ({Object.keys(files).length} files)
              </button>
            ) : (
              <button
                onClick={next}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-amber-500"
              >
                Next <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>

        <aside className="md:sticky md:top-20 md:self-start">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950/70">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
              <Gauge size={11} className="text-amber-500" /> Setup score
            </div>
            <p className="text-2xl font-black text-neutral-900 dark:text-white">{setupScore.overall}%</p>
            <p className="mt-0.5 text-[10px] leading-4 text-neutral-500">
              How filled your setup is. Wizard progress is in the bar above.
            </p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-900">
              <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${setupScore.overall}%` }} />
            </div>

            <div className="mt-4 space-y-1.5 text-xs">
              <Stat label="Workspaces" value={config.workspaces.length} />
              <Stat label="Tools on" value={Object.values(config.tools).filter(Boolean).length} />
              <Stat label="Exports" value={Object.values(config.exportTargets).filter(Boolean).length} />
              <Stat label="Files to make" value={Object.keys(files).length} highlight />
            </div>

            {validation.length > 0 && (
              <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2 text-[11px] leading-4 text-amber-700 dark:text-amber-200">
                {validation.length} thing{validation.length > 1 ? "s" : ""} to check on review.
              </div>
            )}

            {!isLast && (
              <button
                onClick={downloadZip}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-2 text-xs font-bold text-neutral-700 transition hover:border-amber-500 hover:text-amber-600 dark:border-neutral-700 dark:text-neutral-200 dark:hover:text-amber-300"
              >
                <Download size={12} /> Download now
              </button>
            )}
          </div>
        </aside>
    </main>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-neutral-500">{label}</span>
      <span className={`font-bold ${highlight ? "text-amber-600 dark:text-amber-300" : "text-neutral-900 dark:text-white"}`}>{value}</span>
    </div>
  );
}

/* ---------- STEPS ---------- */

function StepYou({ config, setField, roleList, newRole, setNewRole, addRole, removeRole }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Your name" value={config.userName} onChange={(v) => setField("userName", v)} placeholder="e.g. Krishna" />
        <Field label="Name for the agent" value={config.operatorName} onChange={(v) => setField("operatorName", v)} placeholder="Hermes" />
        <Field label="Company / team (optional)" value={config.companyName} onChange={(v) => setField("companyName", v)} />
        <Field label="Profile name" value={config.profileName} onChange={(v) => setField("profileName", v)} placeholder="default" />
      </div>

      <div>
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">What hats do you wear?</span>
        <div className="rounded-xl border border-neutral-200 bg-white p-2.5 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {roleList.map((role) => (
              <button
                key={role}
                onClick={() => removeRole(role)}
                className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 transition hover:border-red-500 hover:text-red-600 dark:text-amber-200 dark:hover:text-red-200"
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
              className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs text-neutral-900 outline-none focus:border-amber-500 dark:border-neutral-800 dark:bg-black dark:text-neutral-100"
            />
            <button onClick={addRole} className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-500">
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
      <div className="flex flex-wrap items-center gap-1.5">
        {config.workspaces.map((w, i) => (
          <button
            key={w.id}
            onClick={() => setActiveWorkspace(i)}
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
              i === activeWorkspace
                ? "border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-100"
                : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300 dark:hover:border-neutral-600"
            }`}
          >
            {w.name || `Workspace ${i + 1}`}
          </button>
        ))}
        {missingLibraryWorkspaces.length > 0 && (
          <div className="ml-1 flex flex-wrap gap-1.5 border-l border-neutral-200 pl-2 dark:border-neutral-800">
            {missingLibraryWorkspaces.slice(0, 6).map((w) => (
              <button
                key={w.id}
                onClick={() => addWorkspaceFromLibrary(w)}
                className="rounded-lg border border-dashed border-neutral-300 px-2 py-1 text-[11px] font-semibold text-neutral-600 hover:border-amber-500 hover:text-amber-600 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-amber-300"
                title={`Add ${w.name}`}
              >
                + {w.name}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={addWorkspace}
          className="rounded-lg border border-dashed border-neutral-300 px-2 py-1 text-[11px] font-semibold text-neutral-600 hover:border-amber-500 hover:text-amber-600 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-amber-300"
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
              className="mb-0.5 rounded-lg border border-neutral-200 p-2 text-neutral-500 transition hover:border-red-500 hover:text-red-500 dark:border-neutral-800"
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
            label="Hermes must ask before…"
            hint="Anything ticked here pauses Hermes for your approval."
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
              ? "border-amber-500 bg-amber-500/10"
              : "border-neutral-200 bg-neutral-50 hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-neutral-600"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{tool.label}</p>
            {config.tools[tool.key] && <Check className="text-amber-500" size={14} />}
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
              ? "border-amber-500 bg-amber-500/10"
              : "border-neutral-200 bg-neutral-50 hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-neutral-600"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{target.label}</p>
            {config.exportTargets[target.key] && <Check className="text-amber-500" size={14} />}
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
          config.backupEnabled ? "border-amber-500 bg-amber-500/10" : "border-neutral-200 dark:border-neutral-800"
        }`}
      >
        <span>
          <span className="block text-sm font-semibold text-neutral-900 dark:text-white">Back up every hour</span>
          <span className="text-xs text-neutral-500">Skips secrets and caches. Local only.</span>
        </span>
        {config.backupEnabled && <Check className="text-amber-500" size={16} />}
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
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-200">Ready. {fileCount} files for {config.operatorName}.</p>
            <p className="mt-0.5 text-xs text-amber-700/70 dark:text-amber-100/70">
              The ZIP contains a <code className="rounded bg-black/10 px-1 dark:bg-black/40">.agent</code> folder, an <code className="rounded bg-black/10 px-1 dark:bg-black/40">exports/</code> folder, and README.md.
            </p>
          </div>
          <button
            onClick={downloadZip}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-black text-white transition hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-amber-200"
          >
            {downloaded ? <Check size={14} /> : <Download size={14} />}
            {downloaded ? "Downloaded" : "Download ZIP"}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-amber-700/60 dark:text-amber-100/60">
          On macOS, dot-folders (like <code>.agent</code>) are hidden by default. Press <kbd className="rounded bg-black/10 px-1 dark:bg-black/40">Cmd ⇧ .</kbd> in Finder to show them.
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
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">How Hermes will behave</p>
          <BehaviorPreview config={config} />
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Workspaces</p>
          <BrainMap workspaces={config.workspaces} />
        </div>
      </div>

      <details className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-950">
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
          Test prompts ({testPrompts.length})
        </summary>
        <div className="mt-3 space-y-2">
          {testPrompts.map((prompt, index) => (
            <div key={index} className="rounded-lg border border-neutral-200 bg-white p-2.5 dark:border-neutral-800 dark:bg-black/40">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-semibold text-neutral-900 dark:text-white">Test {index + 1}</p>
                <button
                  onClick={() => copyPrompt(prompt, index)}
                  className="inline-flex items-center gap-1 rounded border border-neutral-200 px-1.5 py-0.5 text-[11px] text-neutral-500 hover:border-amber-500 hover:text-amber-600 dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-amber-300"
                >
                  {copiedPrompt === index ? <Check size={11} /> : <Copy size={11} />}
                  {copiedPrompt === index ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-[11px] leading-4 text-neutral-600 dark:text-neutral-500">{prompt}</pre>
            </div>
          ))}
        </div>
      </details>

      <details className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-950" onToggle={(e) => setShowFiles(e.currentTarget.open)}>
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
          {showFiles ? "Hide" : "Show"} all {fileCount} files
        </summary>
        <div className="mt-2 max-h-56 overflow-auto font-mono text-[11px] leading-5 text-neutral-600 dark:text-neutral-400">
          {Object.keys(files).map((path) => (
            <div key={path} className="flex items-center gap-1.5 py-0.5">
              <FileText size={10} className="text-amber-500" /> {path}
            </div>
          ))}
        </div>
      </details>

      <details className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-950">
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
          <Eye size={11} className="mr-1 inline" /> Preview SOUL.md
        </summary>
        <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap text-[11px] leading-4 text-neutral-600 dark:text-neutral-400">{soulPreview}</pre>
      </details>
    </div>
  );
}
