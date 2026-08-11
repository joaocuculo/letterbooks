import type { BookResponse, DiscoverResponse } from '../types/book';
import { api } from './api';

export async function discover(): Promise<DiscoverResponse> {
    const response = await api.get<DiscoverResponse>('books/discover');
    return response.data;
}

export async function getBookById(
    googleBooksId: string,
    signal?: AbortSignal
): Promise<BookResponse> {
    const response = await api.get<BookResponse>(
        `books/${encodeURIComponent(googleBooksId)}`,
        { signal }
    );

    return response.data;
}
