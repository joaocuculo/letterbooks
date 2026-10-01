import type {
    PasswordChangeRequest,
    UserProfileUpdate,
    UserResponse,
} from '../types/user';
import { api } from './api';

export async function findMe(signal?: AbortSignal): Promise<UserResponse> {
    const response = await api.get<UserResponse>('/users/me', { signal });

    return response.data;
}

export async function updateMe(
    data: UserProfileUpdate
): Promise<UserResponse> {
    const response = await api.patch<UserResponse>('/users/me', data);

    return response.data;
}

export async function changePassword(
    data: PasswordChangeRequest
): Promise<void> {
    await api.patch('/users/me/password', data);
}
