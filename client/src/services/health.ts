import api from "./api";

export async function checkHealth(){
    const response = await api.get("/health");
    console.log("Health check response:", response.data);
    return response.data;
}