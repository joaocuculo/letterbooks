import axios from 'axios';
import { useEffect, useState, type ReactNode } from 'react';
import { findMe } from '../services/userService';
import type { UserResponse } from '../types/user';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';
import { getToken, removeToken, saveToken } from '../utils/authStorage';
import { AuthContext } from './AuthContext';

import {
    expireSession,
    SESSION_EXPIRED,
    tokenExpiresAt,
} from '../utils/session';
import { toast } from '../components/ui/toast-manager';
interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [token, setToken] = useState<string | null>(() => getToken());
    const [user, setUser] = useState<UserResponse | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState(token !== null);
    const [userErrorMessage, setUserErrorMessage] = useState<string | null>(
        null
    );
    const [userReloadKey, setUserReloadKey] = useState(0);
    const isAuthenticated = token !== null;

    useEffect(() => {
        function clearSession() {
            setToken(null);
            setUser(null);
            setUserErrorMessage(null);
            setIsLoadingUser(false);
        }
        function onExpired() {
            clearSession();
            toast.add({
                id: 'session-expired',
                title: 'Sua sessão expirou. Entre novamente para continuar.',
            });
        }
        function onStorage(event: StorageEvent) {
            if (event.key === 'letterbooks.token' || event.key === null) {
                const stored = getToken();
                if (!stored) clearSession();
                else {
                    setUser(null);
                    setToken(stored);
                }
            }
        }
        window.addEventListener(SESSION_EXPIRED, onExpired);
        window.addEventListener('storage', onStorage);
        return () => {
            window.removeEventListener(SESSION_EXPIRED, onExpired);
            window.removeEventListener('storage', onStorage);
        };
    }, []);
    useEffect(() => {
        if (!token) return;
        const currentToken = token;
        let timer: ReturnType<typeof setTimeout>;
        function checkExpiration() {
            clearTimeout(timer);
            const remaining = tokenExpiresAt(currentToken) - Date.now();
            if (remaining <= 0) expireSession(currentToken);
            else
                timer = setTimeout(
                    checkExpiration,
                    Math.min(remaining, 2_147_483_647)
                );
        }
        timer = setTimeout(checkExpiration, 0);
        window.addEventListener('focus', checkExpiration);
        window.addEventListener('pageshow', checkExpiration);
        document.addEventListener('visibilitychange', checkExpiration);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('focus', checkExpiration);
            window.removeEventListener('pageshow', checkExpiration);
            document.removeEventListener('visibilitychange', checkExpiration);
        };
    }, [token]);

    useEffect(() => {
        if (!token) {
            return;
        }

        const abortController = new AbortController();

        async function loadUser() {
            try {
                setIsLoadingUser(true);
                setUserErrorMessage(null);

                const authenticatedUser = await findMe(abortController.signal);
                if (!abortController.signal.aborted && getToken() === token)
                    setUser(authenticatedUser);
            } catch (error) {
                if (axios.isCancel(error)) {
                    return;
                }

                if (abortController.signal.aborted || getToken() !== token)
                    return;

                setUserErrorMessage(
                    getApiErrorMessage(
                        error,
                        'Não foi possível carregar o usuário autenticado.'
                    )
                );
            } finally {
                if (!abortController.signal.aborted && getToken() === token) {
                    setIsLoadingUser(false);
                }
            }
        }

        void loadUser();

        return () => abortController.abort();
    }, [token, userReloadKey]);

    function signIn(newToken: string) {
        saveToken(newToken);
        setUser(null);
        setUserErrorMessage(null);
        setIsLoadingUser(true);
        setToken(newToken);
    }

    function signOut() {
        removeToken();
        setToken(null);
        setUser(null);
        setUserErrorMessage(null);
        setIsLoadingUser(false);
    }

    function refreshUser() {
        if (token) {
            setUserReloadKey((current) => current + 1);
        }
    }

    return (
        <AuthContext
            value={{
                token,
                user,
                isAuthenticated,
                isLoadingUser,
                userErrorMessage,
                signIn,
                signOut,
                refreshUser,
            }}
        >
            {children}
        </AuthContext>
    );
}
