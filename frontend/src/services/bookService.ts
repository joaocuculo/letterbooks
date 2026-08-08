import type { BookResponse } from '../types/book';
import { api } from './api';

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
