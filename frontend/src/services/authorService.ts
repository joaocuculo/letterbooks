import type {
    AuthorMergeRequest,
    AuthorNameResponse,
    AuthorRequest,
    AuthorResponse,
} from '../types/author';
import type { PageResponse } from '../types/page';
import { api } from './api';

export async function findAuthors(
    page = 0,
    signal?: AbortSignal
): Promise<PageResponse<AuthorResponse>> {
    const response = await api.get<PageResponse<AuthorResponse>>('/authors', {
        params: { page, size: 20 },
        signal,
    });

    return response.data;
}

export async function findAuthorById(
    authorId: number,
    signal?: AbortSignal
): Promise<AuthorResponse> {
    const response = await api.get<AuthorResponse>(
        `/authors/${encodeURIComponent(authorId)}`,
        { signal }
    );

    return response.data;
}

export async function createAuthor(data: AuthorRequest): Promise<AuthorResponse> {
    const response = await api.post<AuthorResponse>('/authors', data);
    return response.data;
}

export async function findAuthorNames(
    authorId: number,
    signal?: AbortSignal
): Promise<AuthorNameResponse[]> {
    const response = await api.get<AuthorNameResponse[]>(
        `/authors/${encodeURIComponent(authorId)}/names`,
        { signal }
    );

    return response.data;
}

export async function addAuthorAlternativeName(
    authorId: number,
    name: string
): Promise<AuthorNameResponse> {
    const response = await api.post<AuthorNameResponse>(
        `/authors/${encodeURIComponent(authorId)}/names`,
        { name }
    );

    return response.data;
}

export async function changeAuthorPrimaryName(
    authorId: number,
    authorNameId: number
): Promise<AuthorNameResponse> {
    const response = await api.patch<AuthorNameResponse>(
        `/authors/${encodeURIComponent(authorId)}/names/${encodeURIComponent(authorNameId)}/primary`
    );

    return response.data;
}

export async function removeAuthorName(
    authorId: number,
    authorNameId: number
): Promise<void> {
    await api.delete(
        `/authors/${encodeURIComponent(authorId)}/names/${encodeURIComponent(authorNameId)}`
    );
}

export async function mergeAuthors(data: AuthorMergeRequest): Promise<void> {
    await api.post('/authors/merge', data);
}
