import * as FileSystem from "expo-file-system";

const DIR = FileSystem.documentDirectory + "logs/";
let sessionId = "";
let buffer: string[] = [];
let lastFlush = 0;
const FLUSH_INTERVAL_MS = 15000; // 15s
const MAX_FILE_BYTES = 512 * 1024; // 512KB por sesión

function nowIso() {
  return new Date().toISOString();
}
function fileForSession() {
  return `${DIR}session-${sessionId}.log`;
}

export async function initLogger(newSessionId: string) {
  sessionId = newSessionId;
  await FileSystem.makeDirectoryAsync(DIR, { intermediates: true }).catch(
    () => {}
  );
  await write(`[BOOT] session=${sessionId} time=${nowIso()}`);
}

async function ensureSizeLimit() {
  const info = await FileSystem.getInfoAsync(fileForSession());
  if (!info.exists) return;
  if ((info.size ?? 0) > MAX_FILE_BYTES) {
    const content = await FileSystem.readAsStringAsync(fileForSession());
    const keep = content.slice(Math.floor(content.length / 2)); // conserva mitad final
    await FileSystem.writeAsStringAsync(fileForSession(), keep);
  }
}

async function flush(force = false) {
  const t = Date.now();
  if (!force && t - lastFlush < FLUSH_INTERVAL_MS) return;
  if (buffer.length === 0) return;
  const chunk = buffer.join("\n") + "\n";
  buffer = [];
  lastFlush = t;

  // “append” manual: leemos actual y escribimos concatenado (suficiente para logs pequeños)
  let existing = "";
  const info = await FileSystem.getInfoAsync(fileForSession());
  if (info.exists)
    existing = await FileSystem.readAsStringAsync(fileForSession());
  await FileSystem.writeAsStringAsync(fileForSession(), existing + chunk);
  await ensureSizeLimit();
}

async function write(line: string) {
  buffer.push(`${nowIso()} ${line}`);
  // flush perezoso
  flush().catch(() => {});
}

export function logInfo(tag: string, data?: any) {
  write(`[INFO] ${tag} ${safe(data)}`);
}
export function logWarn(tag: string, data?: any) {
  write(`[WARN] ${tag} ${safe(data)}`);
}
export function logError(tag: string, data?: any) {
  write(`[ERROR] ${tag} ${safe(data)}`);
}
export function logEvent(tag: string, data?: any) {
  write(`[EVENT] ${tag} ${safe(data)}`);
}

function safe(data: any) {
  if (data == null) return "";
  try {
    return JSON.stringify(data);
  } catch {
    return String(data);
  }
}

export async function forceFlush() {
  await flush(true);
}
export async function getLogPath() {
  await flush(true);
  return fileForSession();
}
export async function clearLogs() {
  const files = await FileSystem.readDirectoryAsync(DIR);
  await Promise.all(files.map((f) => FileSystem.deleteAsync(DIR + f)));
}
