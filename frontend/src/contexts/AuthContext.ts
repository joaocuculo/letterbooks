import { createContext } from "react";

export interface AuthContextData {
    token: string | null;
    isAuthenticated: boolean;
    signIn: (token: string) => void;
    signOut: () => void;
}

export const AuthContext = createContext<AuthContextData | undefined>(undefined);