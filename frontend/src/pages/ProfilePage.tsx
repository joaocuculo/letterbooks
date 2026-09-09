import axios from 'axios';
import { useEffect, useState } from 'react';
import { findMe } from '../services/userService';
import type { UserResponse, UserRole, UserStatus } from '../types/user';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';

const roleLabels: Record<UserRole, string> = {
    ADMIN: 'Administrador',
    USER: 'Usuário',
};

const statusLabels: Record<UserStatus, string> = {
    ACTIVE: 'Ativa',
    INACTIVE: 'Inativa',
};

function formatRegistrationDate(date: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(date));
}

function ProfilePage() {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const abortController = new AbortController();

        async function loadProfile() {
            try {
                setIsLoading(true);
                setErrorMessage(null);

                const authenticatedUser = await findMe(
                    abortController.signal
                );
                setUser(authenticatedUser);
            } catch (error) {
                if (!axios.isCancel(error)) {
                    setUser(null);
                    setErrorMessage(
                        getApiErrorMessage(
                            error,
                            'Não foi possível carregar seu perfil.'
                        )
                    );
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        void loadProfile();

        return () => abortController.abort();
    }, []);

    if (isLoading) {
        return (
            <p className="mx-auto max-w-7xl px-4 py-6">
                Carregando seu perfil...
            </p>
        );
    }

    if (errorMessage || !user) {
        return (
            <main className="mx-auto max-w-7xl px-4 py-6">
                <h1 className="mb-6">Meu perfil</h1>
                <p role="alert">
                    {errorMessage ?? 'Não foi possível carregar seu perfil.'}
                </p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-7xl px-4 py-6">
            <h1 className="mb-6">Meu perfil</h1>

            <section className="max-w-2xl rounded-md border p-4">
                <h2 className="mb-4">Informações da conta</h2>

                <dl className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <dt>Nome</dt>
                        <dd>{user.name}</dd>
                    </div>

                    <div>
                        <dt>E-mail</dt>
                        <dd>{user.email}</dd>
                    </div>

                    <div>
                        <dt>Tipo de conta</dt>
                        <dd>{roleLabels[user.role]}</dd>
                    </div>

                    <div>
                        <dt>Situação</dt>
                        <dd>{statusLabels[user.status]}</dd>
                    </div>

                    <div>
                        <dt>Membro desde</dt>
                        <dd>{formatRegistrationDate(user.createdAt)}</dd>
                    </div>
                </dl>
            </section>
        </main>
    );
}

export default ProfilePage;
