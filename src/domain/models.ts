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
  durationMinutes: number;
  colorHex: string;
};

export type Settings = {
  announceStart: boolean;
  announceCountdown: boolean;
  tickTackEnabled: boolean;
  alarmEnabled: boolean;
  tickTackVolume: number;
};

export type RuntimeStatus = "idle" | "running" | "paused";

export type RuntimeState = {
  currentGroupId?: UUID | null;
  currentSequenceIndex: number;
  remainingMillis: number;
  status: RuntimeStatus;
  endTime?: number | null;
};
