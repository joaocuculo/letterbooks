import type { UserBookStatus } from '../types/userBook';

export const userBookStatusLabels: Record<UserBookStatus, string> = {
    WANT_TO_READ: 'Quero ler',
    READING: 'Lendo',
    COMPLETED: 'Lido',
    ABANDONED: 'Abandonado',
};

export const userBookStatusOptions = Object.entries(
    userBookStatusLabels
).map(([value, label]) => ({
    value: value as UserBookStatus,
    label,
}));

export function isUserBookStatus(value: string | null): value is UserBookStatus {
    return value !== null && value in userBookStatusLabels;
}
