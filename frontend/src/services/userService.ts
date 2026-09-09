import type { UserResponse } from '../types/user';
import { api } from './api';

export async function findMe(signal?: AbortSignal): Promise<UserResponse> {
    const response = await api.get<UserResponse>('/users/me', { signal });

    return response.data;
}
