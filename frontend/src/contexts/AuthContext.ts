import { createContext } from "react";
import type { UserResponse } from "../types/user";

export interface AuthContextData {
    token: string | null;
    user: UserResponse | null;
    isAuthenticated: boolean;
    isLoadingUser: boolean;
    userErrorMessage: string | null;
    signIn: (token: string) => void;
    signOut: () => void;
    refreshUser: () => void;
}

export const AuthContext = createContext<AuthContextData | undefined>(undefined);
