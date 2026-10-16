import type {
    PasswordChangeRequest,
    UserProfileUpdate,
    UserResponse,
} from '../types/user';
import { api } from './api';
import type { PageResponse } from '../types/page';

export async function deleteAccount(
    id: number,
    currentPassword: string
): Promise<void> {
    await api.delete(`/users/${id}`, { data: { currentPassword } });
}

export async function findUsers(
    page = 0,
    signal?: AbortSignal
): Promise<PageResponse<UserResponse>> {
    const response = await api.get<PageResponse<UserResponse>>('/users', {
        params: { page, size: 20, sort: 'createdAt,desc' },
        signal,
    });
    return response.data;
}

export async function findMe(signal?: AbortSignal): Promise<UserResponse> {
    const response = await api.get<UserResponse>('/users/me', { signal });

    return response.data;
}

export async function updateUserRoleAndStatus(
    id: number,
    data: Pick<UserResponse, 'role' | 'status'>
): Promise<UserResponse> {
    const response = await api.put<UserResponse>(
        `/users/${id}/role-status`,
        data
    );
    return response.data;
}

export async function updateMe(data: UserProfileUpdate): Promise<UserResponse> {
    const response = await api.patch<UserResponse>('/users/me', data);

    return response.data;
}

export async function changePassword(
    data: PasswordChangeRequest
): Promise<void> {
    await api.patch('/users/me/password', data);
}
