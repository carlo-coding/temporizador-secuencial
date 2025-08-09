import { create } from "zustand";
import { RuntimeState } from "../domain/models";

type RuntimeActions = {
  setState: (partial: Partial<RuntimeState>) => void;
  reset: () => void;
};

const initial: RuntimeState = {
  currentGroupId: null,
  currentSequenceIndex: 0,
  remainingMillis: 0,
  status: "idle",
  endTime: null,
};

export const useRuntime = create<RuntimeState & RuntimeActions>((set) => ({
  ...initial,
  setState: (partial) => set((s) => ({ ...s, ...partial })),
  reset: () => set({ ...initial }),
}));
