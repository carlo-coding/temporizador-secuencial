import AsyncStorage from "@react-native-async-storage/async-storage";
import { logEvent } from "./logger";

const SNAPSHOT_KEY = "diag:lastRuntimeSnapshot";

export type RuntimeSnapshot = {
  status: string;
  currentGroupId?: string | null;
  currentSequenceIndex: number;
  remainingMillis: number;
  endTime?: number | null;
  at: number;
};

export async function saveRuntimeSnapshot() {
  try {
    // import tardío para evitar ciclos
    const { useRuntime } = await import("../runtime/runtimeStore");
    const s = useRuntime.getState();
    const snap: RuntimeSnapshot = {
      status: s.status,
      currentGroupId: s.currentGroupId ?? null,
      currentSequenceIndex: s.currentSequenceIndex,
      remainingMillis: s.remainingMillis,
      endTime: s.endTime ?? null,
      at: Date.now(),
    };
    await AsyncStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snap));
  } catch {}
}

export async function readLastSnapshot(): Promise<RuntimeSnapshot | null> {
  try {
    const raw = await AsyncStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function hookPeriodicSnapshot() {
  // cada 15s guardamos un snapshot mínimo (barato)
  setInterval(() => {
    saveRuntimeSnapshot().catch(() => {});
  }, 15000);
  logEvent("SnapshotHookInstalled");
}
