import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "../types/auth";
import { api } from "./api";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(
        "/auth/login",
        credentials
    );
    
    return response.data;
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>(
        "/auth/register",
        data
    );

    return response.data;
}