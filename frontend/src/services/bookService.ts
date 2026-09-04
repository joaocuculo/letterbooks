import type { BookCardResponse, BookResponse } from '../types/book';
import type { BookSearchFilters } from '../types/bookSearch';
import type { DiscoverResponse } from '../types/discover';
import type { PageResponse } from '../types/page';
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

export async function searchBooks(
    filters: BookSearchFilters,
    page: number,
    signal?: AbortSignal
): Promise<PageResponse<BookCardResponse>> {
    const response = await api.get<PageResponse<BookCardResponse>>(
        'books/search',
        {
            params: {
                ...filters,
                page,
                size: 10,
            },
            signal,
        }
    );

    return response.data;
}
