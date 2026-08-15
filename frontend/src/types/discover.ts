import type { BookCardResponse } from './book';

export interface DiscoverSection {
    key: string;
    title: string;
    books: BookCardResponse[];
}

export interface DiscoverResponse {
    sections: DiscoverSection[];
}
