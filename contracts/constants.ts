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

// ---------------------------------------------------------------------------
// Reservations
// ---------------------------------------------------------------------------

/**
 * How long one seating lasts, in minutes. Two reservations collide on the same
 * table when their start times are closer together than this.
 */
export const ReservationSlotMinutes = 120;

/** Areas of the dining room. Stored as an id on `tables.area`. */
export const RESERVATION_AREA_IDS = ["main", "terrace", "window", "stage"] as const;

export type ReservationAreaId = (typeof RESERVATION_AREA_IDS)[number];

export const RESERVATION_AREAS: {
  id: ReservationAreaId;
  en: string;
  ar: string;
}[] = [
    { id: "main", en: "Main Hall", ar: "القاعة الرئيسية" },
    { id: "terrace", en: "Terrace", ar: "التراس" },
    { id: "window", en: "By the Window", ar: "بجوار النافذة" },
    { id: "stage", en: "Near the Stage", ar: "بجوار المسرح" },
  ];

/** Human label for an area id, falling back to the raw id for legacy rows. */
export function areaLabel(
  id: string | null | undefined,
  lang: "en" | "ar",
): string {
  if (!id) return "";
  const area = RESERVATION_AREAS.find((a) => a.id === id);
  return area ? area[lang] : id;
}