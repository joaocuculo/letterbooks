import axios from 'axios';
import { useEffect, useState, type ReactNode } from "react";
import { findMe } from '../services/userService';
import type { UserResponse } from '../types/user';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';
import { getToken, removeToken, saveToken } from "../utils/authStorage";
import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({
    children
}: AuthProviderProps) {
    const [token, setToken] = useState<string | null>(
        () => getToken()
    );
    const [user, setUser] = useState<UserResponse | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState(token !== null);
    const [userErrorMessage, setUserErrorMessage] = useState<string | null>(null);
    const [userReloadKey, setUserReloadKey] = useState(0);
    const isAuthenticated = token !== null;

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
                setUser(authenticatedUser);
            } catch (error) {
                if (axios.isCancel(error)) {
                    return;
                }

                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    removeToken();
                    setToken(null);
                    setUser(null);
                    return;
                }

                setUserErrorMessage(
                    getApiErrorMessage(
                        error,
                        'Não foi possível carregar o usuário autenticado.'
                    )
                );
            } finally {
                if (!abortController.signal.aborted) {
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
