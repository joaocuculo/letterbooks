export type BookSource = 'GOOGLE' | 'LOCAL';

export interface BookCardResponse {
    id: string;
    title: string;
    authors: string[] | null;
    publisher: string | null;
    publishedDate: string | null;
    thumbnailUrl: string | null;
}

export interface BookResponse {
    id: string;
    title: string;
    subtitle: string | null;
    authors: string[] | null;
    publisher: string | null;
    publishedDate: string | null;
    categories: string[] | null;
    description: string | null;
    pageCount: number | null;
    language: string | null;
    isbn: string | null;
    maturityRating: string | null;
    imageUrl: string | null;
    thumbnailUrl: string | null;
    source: BookSource;
}

export interface BookSummary {
    id: number;
    title: string;
    thumbnailUrl: string | null;
}
