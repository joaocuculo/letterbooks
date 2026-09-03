import type { BookSummary } from './book';
import type { UserSummary } from './user';

export interface RatingRequest {
    score: number;
    comment?: string;
    googleBooksId: string;
}

export interface RatingUpdate {
    score: number;
    comment?: string;
}

export interface RatingResponse {
    id: number;
    score: number;
    comment: string | null;
    createdAt: string;
    updatedAt: string;
    user: UserSummary;
    book: BookSummary;
}
