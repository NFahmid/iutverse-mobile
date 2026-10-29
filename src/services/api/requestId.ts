/**
 * Request correlation ids. The backend echoes `X-Request-Id` when it is 8 to 128 characters of `A-Za-z0-9._:-`,
 * otherwise it generates its own. A UUID always qualifies.
 */
export const REQUEST_ID_HEADER = "X-Request-Id";

export type RequestIdFactory = () => string;

export const createRequestId: RequestIdFactory = () => {
  const crypto = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (typeof crypto?.randomUUID === "function") return crypto.randomUUID();
  // Hermes may not expose crypto.randomUUID. The id is for correlation only, not security, so a time + random fallback is enough.
  const random = () => Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
  return `m-${Date.now().toString(36)}-${random()}${random()}`;
};
