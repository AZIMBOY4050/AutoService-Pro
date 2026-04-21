function hasMeta(meta) {
  return Boolean(meta && Object.keys(meta).length);
}

export function logInfo(message, meta = {}) {
  if (hasMeta(meta)) {
    console.log(`[INFO] ${new Date().toISOString()} ${message}`, meta);
    return;
  }

  console.log(`[INFO] ${new Date().toISOString()} ${message}`);
}

export function logWarn(message, meta = {}) {
  if (hasMeta(meta)) {
    console.warn(`[WARN] ${new Date().toISOString()} ${message}`, meta);
    return;
  }

  console.warn(`[WARN] ${new Date().toISOString()} ${message}`);
}

export function logError(message, error, meta = {}) {
  if (hasMeta(meta)) {
    console.error(`[ERROR] ${new Date().toISOString()} ${message}`, meta, error);
    return;
  }

  console.error(`[ERROR] ${new Date().toISOString()} ${message}`, error);
}
