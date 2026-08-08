export interface ApiErrorResponse {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    path: string;
}

export interface FieldErrorResponse {
    field: string;
    message: string;
}

export interface ValidationErrorResponse extends ApiErrorResponse {
    errors: FieldErrorResponse[];
}
