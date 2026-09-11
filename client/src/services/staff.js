import api from "./api";

/**
 * Check a citizen in by identifier.
 * @param {string} identifier - token number, token id, or phone number
 */
export async function checkInToken(identifier) {
  const { data } = await api.post("/staff/tokens/check-in", { identifier });
  return data;
}

/**
 * Fetch the queue board for a single stage: serving / checked-in /
 * waiting / recently-skipped tokens.
 * @param {string} stageId
 */
export async function fetchStageQueue(stageId) {
  const { data } = await api.get(`/staff/queues/${stageId}`);
  return data;
}

/**
 * Fetch an overview of every service's stages with live serving/checked-in/
 * waiting counts, for the staff dashboard.
 */
export async function fetchQueueSummary() {
  const { data } = await api.get("/staff/queues/summary");
  return data;
}

/** Start service for a citizen who has checked in at the counter (CHECKED_IN → SERVING). */
export async function callToken(tokenId) {
  const { data } = await api.post(`/staff/tokens/${tokenId}/call`);
  return data;
}

/** Mark a token as a no-show (CALLED/WAITING → SKIPPED). */
export async function skipToken(tokenId) {
  const { data } = await api.post(`/staff/tokens/${tokenId}/skip`);
  return data;
}

/** Recall a skipped token back into the queue (SKIPPED → WAITING). */
export async function recallToken(tokenId) {
  const { data } = await api.post(`/staff/tokens/${tokenId}/recall`);
  return data;
}

/** Complete the current stage (SERVING → next stage's queue, or COMPLETED). */
export async function completeToken(tokenId) {
  const { data } = await api.post(`/staff/tokens/${tokenId}/complete`);
  return data;
}

export async function searchStaffTokens(query) { const { data } = await api.get("/staff/tokens/search", { params: { q: query } }); return data; }
