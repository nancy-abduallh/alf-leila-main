export const Session = {
  cookieName: "session_id",
  maxAgeMs: 30 * 24 * 60 * 60 * 1000,
} as const;

export const ErrorMessages = {
  unauthenticated: "Authentication required",
  insufficientRole: "Insufficient permissions",
} as const;

export const Paths = {
  login: "/login",
  register: "/register",
} as const;

// How long a dine-in order stays editable before it's sent to the kitchen.
export const TableOrdering = {
  editWindowMs: 5 * 60 * 1000,
  batchPollIntervalMs: 15 * 1000,
} as const;