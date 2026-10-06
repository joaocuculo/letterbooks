import type {
    CategoryMergeRequest,
    CategoryNameResponse,
    CategoryRequest,
    CategoryResponse,
} from '../types/category';
import type { PageResponse } from '../types/page';
import { api } from './api';

export async function findCategories(
    page = 0,
    signal?: AbortSignal
): Promise<PageResponse<CategoryResponse>> {
    const response = await api.get<PageResponse<CategoryResponse>>('/categories', {
        params: { page, size: 20 },
        signal,
    });

    return response.data;
}

export async function findCategoryById(
    categoryId: number,
    signal?: AbortSignal
): Promise<CategoryResponse> {
    const response = await api.get<CategoryResponse>(
        `/categories/${encodeURIComponent(categoryId)}`,
        { signal }
    );

    return response.data;
}

export async function createCategories(
    data: CategoryRequest
): Promise<CategoryResponse[]> {
    const response = await api.post<CategoryResponse[]>('/categories', data);
    return response.data;
}

export async function findCategoryNames(
    categoryId: number,
    signal?: AbortSignal
): Promise<CategoryNameResponse[]> {
    const response = await api.get<CategoryNameResponse[]>(
        `/categories/${encodeURIComponent(categoryId)}/names`,
        { signal }
    );

    return response.data;
}

export async function addCategoryAlternativeName(
    categoryId: number,
    name: string
): Promise<CategoryNameResponse> {
    const response = await api.post<CategoryNameResponse>(
        `/categories/${encodeURIComponent(categoryId)}/names`,
        { name }
    );

    return response.data;
}

export async function changeCategoryPrimaryName(
    categoryId: number,
    categoryNameId: number
): Promise<CategoryNameResponse> {
    const response = await api.patch<CategoryNameResponse>(
        `/categories/${encodeURIComponent(categoryId)}/names/${encodeURIComponent(categoryNameId)}/primary`
    );

    return response.data;
}

export async function removeCategoryName(
    categoryId: number,
    categoryNameId: number
): Promise<void> {
    await api.delete(
        `/categories/${encodeURIComponent(categoryId)}/names/${encodeURIComponent(categoryNameId)}`
    );
}

export async function mergeCategories(data: CategoryMergeRequest): Promise<void> {
    await api.post('/categories/merge', data);
}
