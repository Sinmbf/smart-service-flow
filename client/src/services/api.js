import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Attach the JWT to every outgoing request if one is in localStorage.
// AuthContext owns the storage key; this interceptor is the only place
// that reads it for outgoing requests.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
