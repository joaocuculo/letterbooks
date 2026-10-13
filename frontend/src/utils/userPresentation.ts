import type { UserRole, UserStatus } from '../types/user';

export const roleLabels: Record<UserRole, string> = {
    ADMIN: 'Administrador',
    USER: 'Usuário',
};
export const statusLabels: Record<UserStatus, string> = {
    ACTIVE: 'Ativa',
    INACTIVE: 'Inativa',
};
export function formatRegistrationDate(date: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(date));
}
