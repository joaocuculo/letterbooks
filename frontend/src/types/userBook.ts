import type { BookSummary } from './book';
import type { UserSummary } from './user';

export type UserBookStatus =
    | 'WANT_TO_READ'
    | 'READING'
    | 'COMPLETED'
    | 'ABANDONED';

export interface UserBookRequest {
    googleBooksId: string;
    status?: UserBookStatus;
    isFavorite: boolean;
    currentPage?: number | null;
    startedAt?: string | null;
    finishedAt?: string | null;
}

export interface UserBookResponse {
    id: number;
    status: UserBookStatus;
    isFavorite: boolean;
    currentPage: number | null;
    book: BookSummary;
    user: UserSummary;
    startedAt: string | null;
    finishedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface UserBookUpdate {
    status?: UserBookStatus;
    isFavorite?: boolean;
    currentPage?: number | null;
    startedAt?: string | null;
    finishedAt?: string | null;
}
