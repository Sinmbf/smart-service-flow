import api from "./api";

/**
 * Fetch the list of active services.
 * @param {{ search?: string, page?: number, pageSize?: number, lang?: string }} params
 */
export async function fetchServices(params = {}) {
  const { data } = await api.get("/services", { params });
  return data;
}

/**
 * Fetch a single service's full detail (office + stages + documents).
 * @param {string} id
 */
export async function fetchServiceById(id) {
  const { data } = await api.get(`/services/${id}`);
  return data;
}
