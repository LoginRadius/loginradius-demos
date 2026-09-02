// Error types and codes shared by the server modules.
//
// Deliberately free of the `server-only` import so it can be exercised
// directly by tests — it holds no credentials and performs no I/O.

export class LrError extends Error {
  constructor(message, status = 502, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// LoginRadius returns this with HTTP 403 when the account simply has no
// record for the object yet — "The requested custom object of the user's
// account could not be found, please create a custom object before
// requesting." It is a normal empty state, not a failure.
//
// Detected by code rather than by matching the description, which is
// localisable and could be reworded.
export const CUSTOM_OBJECT_RECORD_NOT_EXIST = 1057;

export function isMissingRecordError(err) {
  return Number(err?.code) === CUSTOM_OBJECT_RECORD_NOT_EXIST;
}
