import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import { logEvent, logWarn } from "./logger";

let beatHandle: any = null;
let loopHandle: any = null;
let lastTick = Date.now();
const HEARTBEAT_KEY = "diag:lastHeartbeat";
const LOOP_INTERVAL = 5000;
const GAP_WARN_MS = 30000; // si el “tick” llega 30s tarde, sospechamos

export function startWatchdog(sessionId: string) {
  logEvent("WatchdogStart", { sessionId });

  beatHandle = setInterval(async () => {
    try {
      await AsyncStorage.setItem(HEARTBEAT_KEY, String(Date.now()));
    } catch {}
  }, 10000);

  // Deriva del event loop
  loopHandle = setInterval(() => {
    const now = Date.now();
    const gap = now - lastTick - LOOP_INTERVAL;
    if (gap > GAP_WARN_MS) {
      logWarn("EventLoopGap", { gapMs: gap, now, lastTick });
    }
    lastTick = now;
  }, LOOP_INTERVAL);

  AppState.addEventListener("change", (s) => {
    logEvent("AppState", { state: s });
  });
}

export async function detectUncleanExitOnBoot() {
  try {
    const hb = await AsyncStorage.getItem(HEARTBEAT_KEY);
    if (!hb) return false;
    const last = Number(hb);
    const diff = Date.now() - last;
    // Si el último heartbeat fue hace > 90s y no hemos limpiado (nuevo arranque), asumimos salida no limpia
    if (diff > 90000) {
      logWarn("UncleanExitDetected", { lastHeartbeatMsAgo: diff });
      return true;
    }
  } catch {}
  return false;
}

export function stopWatchdog() {
  if (beatHandle) clearInterval(beatHandle);
  if (loopHandle) clearInterval(loopHandle);
}
