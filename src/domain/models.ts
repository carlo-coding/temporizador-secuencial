export type UUID = string;

export type Group = {
  id: UUID;
  name: string;
  createdAt: number;
  updatedAt: number;
};

export type Sequence = {
  id: UUID;
  groupId: UUID;
  orderIndex: number;
  emoji?: string | null;
  title: string;
  durationMinutes: number; // >= 1
  colorHex: string; // #RRGGBB
};

export type Settings = {
  announceStart: boolean;
  announceCountdown: boolean;
  tickTackEnabled: boolean;
  alarmEnabled: boolean;
  tickTackVolume: number; // 0..1
};

export type RuntimeStatus = "idle" | "running" | "paused";

export type RuntimeState = {
  currentGroupId?: UUID | null;
  currentSequenceIndex: number;
  remainingMillis: number;
  status: RuntimeStatus;
  endTime?: number | null; // para re-cálculo tras foco
};
