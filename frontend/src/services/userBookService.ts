import type { UserBookRequest, UserBookResponse } from '../types/userBook';
import { api } from './api';

export async function create(data: UserBookRequest): Promise<UserBookResponse> {
    const response = await api.post<UserBookResponse>('/user-books', data);

    return response.data;
}
