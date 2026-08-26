import type {
    UserBookRequest,
    UserBookResponse,
    UserBookUpdate,
} from '../types/userBook';
import { api } from './api';

export async function create(data: UserBookRequest): Promise<UserBookResponse> {
    const response = await api.post<UserBookResponse>('/user-books', data);

    return response.data;
}

export async function update(
    bookId: number,
    data: UserBookUpdate
): Promise<UserBookResponse> {
    const response = await api.patch<UserBookResponse>(
        `/user-books/${bookId}`,
        data
    );

    return response.data;
}
