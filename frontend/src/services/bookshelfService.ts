import { api } from './api';
export interface BookshelfMembership {
    id: number;
    name: string;
}
export async function findMineByGoogleBooksId(
    googleBooksId: string,
    signal?: AbortSignal
): Promise<BookshelfMembership[]> {
    const response = await api.get<BookshelfMembership[]>(
        `/bookshelves/book/google/${encodeURIComponent(googleBooksId)}/me`,
        { signal }
    );
    return response.data;
}
