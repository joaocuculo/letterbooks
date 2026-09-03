import type { PageResponse } from '../types/page';
import type {
    RatingRequest,
    RatingResponse,
    RatingUpdate,
} from '../types/rating';
import { api } from './api';

export async function findByGoogleBooksId(
    googleBooksId: string,
    signal?: AbortSignal
): Promise<PageResponse<RatingResponse>> {
    const response = await api.get<PageResponse<RatingResponse>>(
        `/ratings/book/google/${encodeURIComponent(googleBooksId)}`,
        { signal }
    );

    return response.data;
}

export async function findMyRating(
    googleBooksId: string,
    signal?: AbortSignal
): Promise<RatingResponse | null> {
    const response = await api.get<RatingResponse>(
        `/ratings/book/google/${encodeURIComponent(googleBooksId)}/me`,
        { signal }
    );

    return response.status === 204 ? null : response.data;
}

export async function create(
    data: RatingRequest
): Promise<RatingResponse> {
    const response = await api.post<RatingResponse>('/ratings', data);

    return response.data;
}

export async function update(
    ratingId: number,
    data: RatingUpdate
): Promise<RatingResponse> {
    const response = await api.patch<RatingResponse>(
        `/ratings/${ratingId}`,
        data
    );

    return response.data;
}
