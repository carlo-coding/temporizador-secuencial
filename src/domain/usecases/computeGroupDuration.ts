import { Sequence } from "../models";
export function computeTotalMinutes(sequences: Sequence[]): number {
  return sequences.reduce((acc, s) => acc + s.durationMinutes, 0);
}
