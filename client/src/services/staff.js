import api from "./api";

/**
 * Check a citizen in by identifier.
 * @param {string} identifier - token number, token id, or phone number
 */
export async function checkInToken(identifier) {
  const { data } = await api.post("/staff/tokens/check-in", { identifier });
  return data;
}
