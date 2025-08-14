// Very simple in-memory alert store.
// Works locally and on warm serverless instances. For production, use a database or Redis.
export type Signal = {
  time: string;
  ticker: string;
  action: "BUY" | "SELL" | "ALERT";
  note?: string;
};

const MAX_SIGNALS = 200;

// Create a module-scoped singleton so the array can survive warm invocations on Vercel
const globalForStore = globalThis as unknown as { __alertStore?: Signal[] };
export const store: Signal[] = globalForStore.__alertStore || (globalForStore.__alertStore = []);

// Helper to add a new signal
export function addSignal(sig: Signal) {
  store.unshift(sig);
  if (store.length > MAX_SIGNALS) store.length = MAX_SIGNALS;
}

// Get latest N signals
export function getSignals(limit = 50) {
  return store.slice(0, limit);
}