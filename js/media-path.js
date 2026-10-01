/**
 * Paths in config are relative to site root (where index.html lives).
 * From pages/*.html we need ../ — and spaces in filenames must be encoded.
 */
window.resolveSitePath = function resolveSitePath(relativePath) {
  if (!relativePath || typeof relativePath !== "string") return "";

  const trimmed = relativePath.trim();
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;

  const withoutLead = trimmed.replace(/^\/+/, "");
  const encoded = withoutLead
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const pathname = window.location.pathname.replace(/\\/g, "/");
  const inPagesFolder = /\/pages\/[^/]*$/i.test(pathname);

  return inPagesFolder ? `../${encoded}` : encoded;
};
