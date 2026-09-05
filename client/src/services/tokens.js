import api from "./api";

/**
 * Generate a new digital token.
 * @param {{ serviceId: string }} body
 */
export async function generateToken(body) {
  const { data } = await api.post("/tokens", body);
  return data;
}

/**
 * Fetch token status by id (poll endpoint).
 * @param {string} id
 */
export async function fetchToken(id) {
  const { data } = await api.get(`/tokens/${id}`);
  return data;
}

/**
 * List the current user's active tokens.
 * @param {{ all?: boolean }} opts
 */
export async function fetchMyActiveTokens({ all = false } = {}) {
  const { data } = await api.get("/tokens", { params: { mine: "true", ...(all ? { all: "true" } : {}) } });
  return data;
}
