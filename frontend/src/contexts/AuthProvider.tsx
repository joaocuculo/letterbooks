import { useState, type ReactNode } from "react";
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
    const isAuthenticated = token !== null;

    function signIn(newToken: string) {
        saveToken(newToken);
        setToken(newToken);
    }

    function signOut() {
        removeToken();
        setToken(null);
    }

    return (
        <AuthContext
            value={{ 
                token,
                isAuthenticated,
                signIn,
                signOut
             }}
        >
            {children}
        </AuthContext>
    );
}