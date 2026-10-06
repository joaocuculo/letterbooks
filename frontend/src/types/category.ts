export interface CategoryResponse {
    id: number;
    name: string;
}

export interface CategoryNameResponse {
    id: number;
    name: string;
    primary: boolean;
}

export interface CategoryRequest {
    name: string;
}

export interface CategoryMergeRequest {
    targetCategoryId: number;
    sourceCategoryId: number;
}
