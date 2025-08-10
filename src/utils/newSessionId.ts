export function newSessionId() {
  const rnd = Math.random().toString(16).slice(2, 8);
  return `${Date.now()}-${rnd}`;
}
