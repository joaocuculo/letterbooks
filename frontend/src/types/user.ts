export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type UserRole = 'ADMIN' | 'USER';

export interface UserResponse {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    createdAt: string;
}

export interface UserProfileUpdate {
    name: string;
    email: string;
    currentPassword: string | null;
}

export interface PasswordChangeRequest {
    currentPassword: string;
    newPassword: string;
}

export interface UserSummary {
    id: number;
    name: string;
}
