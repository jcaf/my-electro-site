// src/lib/api.ts
export const API = "http://127.0.0.1:8000";

export function toStaticUrl(relPath?: string) {
  if (!relPath) return "";
  const clean = relPath.replace(/^\/+/, ""); // quita '/' inicial si hubiera
  return `${API}/static/${encodeURI(clean)}`;
}
