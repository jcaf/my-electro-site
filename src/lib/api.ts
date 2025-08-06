export const API = "http://localhost:8000";

export function toStaticUrl(rel?: string) {
  if (!rel) return "/placeholder.jpg";
  return `${API}/static/${rel.replace(/^static\//, "")}`;
}
