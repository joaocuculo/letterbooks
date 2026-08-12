import axios from "axios";
import { getToken } from "../utils/authStorage";

const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
    throw new Error("VITE_API_URL não foi configurada.");
}

export const api = axios.create({
    baseURL: apiUrl,
    timeout: 10_000, // 10 segundos
});

api.interceptors.request.use((config) => {
    const token = getToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});