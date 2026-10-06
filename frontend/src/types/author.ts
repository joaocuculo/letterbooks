export interface AuthorResponse {
    id: number;
    name: string;
}

export interface AuthorNameResponse {
    id: number;
    name: string;
    primary: boolean;
}

export interface AuthorRequest {
    name: string;
}

export interface AuthorMergeRequest {
    targetAuthorId: number;
    sourceAuthorId: number;
}
