import axios from 'axios';
import { getToken } from '../utils/authStorage';

import {
    expireSession,
    SESSION_ERROR_CODE,
    tokenExpiresAt,
} from '../utils/session';
const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
    throw new Error('VITE_API_URL não foi configurada.');
}

export const api = axios.create({
    baseURL: apiUrl,
    timeout: 10_000, // 10 segundos
});

api.interceptors.request.use((config) => {
    const token = getToken();

    if (token && tokenExpiresAt(token) <= Date.now()) {
        expireSession(token);
        throw new axios.AxiosError(
            'Session expired',
            SESSION_ERROR_CODE,
            config
        );
    }
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});
api.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            const authorization = error.config?.headers?.Authorization;
            const url = error.config?.url ?? '';
            if (
                typeof authorization === 'string' &&
                authorization.startsWith('Bearer ') &&
                !url.startsWith('/auth/')
            ) {
                expireSession(authorization.slice(7));
                error.code = SESSION_ERROR_CODE;
            }
        }
        return Promise.reject(error);
    }
);
