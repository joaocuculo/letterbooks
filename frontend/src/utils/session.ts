import { getToken, removeToken } from './authStorage';
export const SESSION_EXPIRED = 'letterbooks:session-expired';
export const SESSION_ERROR_CODE = 'ERR_SESSION_EXPIRED';
// Schedules UI cleanup only; signature validation remains on the server.
export function tokenExpiresAt(token: string): number {
    try {
        const payload = token
            .split('.')[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        const { exp } = JSON.parse(atob(payload));
        return typeof exp === 'number' && Number.isFinite(exp) ? exp * 1000 : 0;
    } catch {
        return 0;
    }
}
export function expireSession(token: string): void {
    if (getToken() !== token) return;
    removeToken();
    window.dispatchEvent(new Event(SESSION_EXPIRED));
}
