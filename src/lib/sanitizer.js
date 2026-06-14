/**
 * Recursively sanitizes a payload before sending to Supabase.
 * - Trims string values.
 * - Converts empty strings ("") or whitespace-only strings to `null`.
 * 
 * @param {Object} payload 
 * @returns {Object} Sanitized payload
 */
export function sanitizePayload(payload) {
  if (payload === null || typeof payload !== 'object') {
    return payload;
  }

  // Handle arrays
  if (Array.isArray(payload)) {
    return payload.map(item => sanitizePayload(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      sanitized[key] = trimmed === '' ? null : trimmed;
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizePayload(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
