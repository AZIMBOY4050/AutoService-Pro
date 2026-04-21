import path from "node:path";

export function resolvePublicPath(publicDir, pathname) {
  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const resolved = path.normalize(path.join(publicDir, relativePath));
  return resolved.startsWith(publicDir) ? resolved : null;
}
