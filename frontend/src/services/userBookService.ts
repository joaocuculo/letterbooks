import type {
    UserBookFilters,
    UserBookRequest,
    UserBookResponse,
    UserBookUpdate,
} from '../types/userBook';
import type { PageResponse } from '../types/page';
import { api } from './api';

export async function findMine(
    filters: UserBookFilters = {},
    signal?: AbortSignal
): Promise<PageResponse<UserBookResponse>> {
    const response = await api.get<PageResponse<UserBookResponse>>(
        '/user-books/me',
        {
            params: filters,
            signal,
        }
    );

    return response.data;
}

export async function findByGoogleBooksId(
    googleBooksId: string,
    signal?: AbortSignal
): Promise<UserBookResponse | null> {
    const response = await api.get<UserBookResponse>(
        `/user-books/book/${encodeURIComponent(googleBooksId)}`,
        { signal }
    );

    return response.status === 204 ? null : response.data;
}

export async function create(data: UserBookRequest): Promise<UserBookResponse> {
    const response = await api.post<UserBookResponse>('/user-books', data);

    return response.data;
}

export async function update(
    userBookId: number,
    data: UserBookUpdate
): Promise<UserBookResponse> {
    const response = await api.patch<UserBookResponse>(
        `/user-books/${userBookId}`,
        data
    );

    return response.data;
}

export async function createOrUpdate(
    googleBooksId: string,
    userBookId: number | null,
    data: UserBookUpdate
): Promise<UserBookResponse> {
    if (userBookId !== null) {
        return update(userBookId, data);
    }

    return create({
        googleBooksId,
        status: data.status,
        isFavorite: data.isFavorite ?? false,
        currentPage: data.currentPage,
        startedAt: data.startedAt,
        finishedAt: data.finishedAt,
    });
}
