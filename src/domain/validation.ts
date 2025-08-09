export function isColorHexValid(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}
export function nonEmpty(s: string): boolean {
  return s.trim().length > 0;
}
export function ensureDuration(mins: number): boolean {
  return Number.isInteger(mins) && mins >= 1;
}
