import type {
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    MessageResponse,
    RegisterRequest,
    RegisterResponse,
    ResetPasswordRequest,
} from "../types/auth";
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

export async function requestPasswordReset(
    data: ForgotPasswordRequest
): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>(
        "/auth/forgot-password",
        data
    );

    return response.data;
}

export async function resetPassword(
    data: ResetPasswordRequest
): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>(
        "/auth/reset-password",
        data
    );

    return response.data;
}
