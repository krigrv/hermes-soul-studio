export function slugify(value) {
  return (
    String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || "workspace"
  );
}

export function safe(value, fallback = "Not specified") {
  return value && String(value).trim() ? String(value).trim() : fallback;
}

export function splitList(value) {
  return String(value || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}
