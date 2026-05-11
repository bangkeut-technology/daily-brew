/**
 * Validation helpers for user/workspace/employee public IDs.
 *
 * Public IDs are minted by the backend via `TokenGenerator::generatePublicId()`
 * (src/Util/TokenGenerator.php) using a 12-char human-friendly alphabet that
 * excludes visually ambiguous characters (i, l, o, 0, 1). The pattern below
 * mirrors that backend contract so the UI can reject obvious typos before
 * making a roundtrip.
 */

export const PUBLIC_ID_LENGTH = 12;

// Alphabet from TokenGenerator::generatePublicId — see backend for source of truth.
const PUBLIC_ID_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789';
const PUBLIC_ID_PATTERN = new RegExp(`^[${PUBLIC_ID_CHARS}]{${PUBLIC_ID_LENGTH}}$`);

/**
 * Returns true if the value is a syntactically valid public ID. Does NOT call
 * the backend — actual existence is checked at link time.
 */
export function isValidPublicIdFormat(value: string): boolean {
  return PUBLIC_ID_PATTERN.test(value);
}

/**
 * Returns a human-readable error message for an invalid public ID, or null
 * when the value passes format validation. An empty string is treated as
 * "not yet entered" → returns null (let the consumer handle required/optional).
 */
export function publicIdFormatError(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  if (trimmed.length !== PUBLIC_ID_LENGTH) {
    return `Public ID must be exactly ${PUBLIC_ID_LENGTH} characters (got ${trimmed.length}).`;
  }
  if (!PUBLIC_ID_PATTERN.test(trimmed)) {
    return 'Public ID contains invalid characters. Allowed: a–z (no i, l, o) and 2–9.';
  }
  return null;
}
