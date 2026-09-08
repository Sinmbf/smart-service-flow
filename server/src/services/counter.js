export const counters = new Map();
export const assign = (s) => counters.set(s, (counters.get(s) || 0) + 1);
export const release = (s) => counters.set(s, Math.max(0, (counters.get(s) || 0) - 1));
