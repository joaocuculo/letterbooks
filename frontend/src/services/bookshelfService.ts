import { api } from './api';
import type { BookSummary } from '../types/book';
import type { UserBookResponse } from '../types/userBook';
import type { PageResponse } from '../types/page';
export interface BookshelfSummary {
    id: number;
    name: string;
    description: string | null;
    isPublicShelf: boolean;
    booksCount: number;
    previewBooks: BookSummary[];
    createdAt: string;
    updatedAt: string;
}
export type SavedShelf = Pick<
    BookshelfSummary,
    'id' | 'name' | 'description' | 'isPublicShelf' | 'createdAt' | 'updatedAt'
>;
export interface BookshelfBook {
    book: BookSummary;
    userBook: UserBookResponse | null;
}
export interface ShelfInput {
    name: string;
    description: string;
    isPublicShelf: boolean;
}
export async function listShelves(
    userId: number,
    page = 0,
    signal?: AbortSignal
) {
    return (
        await api.get<PageResponse<BookshelfSummary>>(
            `/bookshelves/user/${userId}`,
            { params: { page, size: 20, sort: 'createdAt,desc' }, signal }
        )
    ).data;
}
export async function shelfSummary(id: number, signal?: AbortSignal) {
    return (
        await api.get<BookshelfSummary>(`/bookshelves/${id}/summary`, {
            signal,
        })
    ).data;
}
export async function shelfBooks(id: number, page = 0, signal?: AbortSignal) {
    return (
        await api.get<PageResponse<BookshelfBook>>(`/bookshelves/${id}/books`, {
            params: { page, size: 20 },
            signal,
        })
    ).data;
}
export async function saveShelf(
    data: ShelfInput,
    id?: number
): Promise<SavedShelf> {
    return (
        id
            ? await api.patch(`/bookshelves/${id}`, data)
            : await api.post('/bookshelves', data)
    ).data;
}
export async function deleteShelf(id: number) {
    await api.delete(`/bookshelves/${id}`);
}
export async function addShelfBook(id: number, googleBooksId: string) {
    await api.post(`/bookshelves/${id}/book`, { googleBooksId });
}
export async function removeShelfBook(id: number, bookId: number) {
    await api.delete(`/bookshelves/${id}/book/${bookId}`);
}
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
