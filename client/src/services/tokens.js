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
