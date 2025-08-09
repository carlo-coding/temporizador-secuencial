import { useRuntime } from "./runtimeStore";

let tickHandle: any = null;
let targetEnd = 0;
let onComplete: (() => void) | null = null;

function stopTick() {
  if (tickHandle) {
    clearInterval(tickHandle);
    tickHandle = null;
  }
}

function finish() {
  stopTick();
  useRuntime
    .getState()
    .setState({ status: "idle", remainingMillis: 0, endTime: null });
  if (onComplete) onComplete();
}

function startLoop() {
  stopTick();
  tickHandle = setInterval(() => {
    const now = Date.now();
    const rem = Math.max(0, targetEnd - now);
    useRuntime
      .getState()
      .setState({ remainingMillis: rem, endTime: targetEnd });
    if (rem <= 0) finish();
  }, 250);
}

export function startTimer(durationMs: number, onDone?: () => void) {
  onComplete = onDone ?? null;
  const now = Date.now();
  targetEnd = now + durationMs;
  useRuntime.getState().setState({
    remainingMillis: durationMs,
    status: "running",
    endTime: targetEnd,
  });
  startLoop();
}

export function pauseTimer() {
  const s = useRuntime.getState();
  if (s.status !== "running") return;
  stopTick();
  const rem = Math.max(0, targetEnd - Date.now());
  useRuntime
    .getState()
    .setState({ status: "paused", remainingMillis: rem, endTime: null });
}

export function resumeTimer(onDone?: () => void) {
  const s = useRuntime.getState();
  if (s.status !== "paused") return;
  onComplete = onDone ?? onComplete;
  targetEnd = Date.now() + s.remainingMillis;
  useRuntime.getState().setState({ status: "running", endTime: targetEnd });
  startLoop();
}

export function stopTimer() {
  stopTick();
  useRuntime
    .getState()
    .setState({ status: "idle", remainingMillis: 0, endTime: null });
  onComplete = null;
}

export function adjustTimer(deltaMs: number) {
  const s = useRuntime.getState();
  const now = Date.now();

  if (s.status === "running") {
    targetEnd = targetEnd + deltaMs;
    if (targetEnd <= now) {
      finish();
      return;
    }
    const rem = Math.max(0, targetEnd - now);
    useRuntime
      .getState()
      .setState({ remainingMillis: rem, endTime: targetEnd });
  } else if (s.status === "paused") {
    const newRem = Math.max(0, s.remainingMillis + deltaMs);
    useRuntime.getState().setState({ remainingMillis: newRem });
  }
}
