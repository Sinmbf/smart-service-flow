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

/**
 * Cancel a token by id (citizen self-cancel; staff can cancel any).
 * @param {string} id
 */
export async function cancelToken(id) {
  const { data } = await api.post(`/tokens/${id}/cancel`);
  return data;
}


/** Fetch recent in-app notifications for the signed-in citizen. */
export async function fetchNotifications(params) {
  const { data } = await api.get("/notifications", { params });
  return data;
}

/** Mark a notification as read. */
export async function markNotificationRead(id) {
  const { data } = await api.post(`/notifications/${id}/read`);
  return data;
}

/** Mark all notifications as read. */
export async function markAllNotificationsRead() {
  const { data } = await api.post("/notifications/read-all");
  return data;
}

/** Delete one notification owned by the signed-in citizen. */
export async function deleteNotification(id) {
  const { data } = await api.delete(`/notifications/${id}`);
  return data;
}

/** Delete all notifications for the signed-in citizen. */
export async function deleteAllNotifications() {
  const { data } = await api.delete("/notifications");
  return data;
}
