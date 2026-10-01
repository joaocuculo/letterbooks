import axios from 'axios';
import { useEffect, useState, type SubmitEvent } from 'react';
import {
    changePassword,
    findMe,
    updateMe,
} from '../services/userService';
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

interface ProfileFormErrors {
    name?: string;
    email?: string;
    currentPassword?: string;
}

interface PasswordFormErrors {
    currentPassword?: string;
    newPassword?: string;
    passwordConfirmation?: string;
}

function formatRegistrationDate(date: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(date));
}

function validateProfileForm(
    name: string,
    email: string,
    currentPassword: string,
    emailChanged: boolean
): ProfileFormErrors {
    const errors: ProfileFormErrors = {};

    if (!name.trim()) {
        errors.name = 'Informe seu nome.';
    }
    if (!email.trim()) {
        errors.email = 'Informe seu e-mail.';
    } else if (!email.includes('@')) {
        errors.email = 'Informe um e-mail válido.';
    }
    if (emailChanged && !currentPassword) {
        errors.currentPassword = 'Informe sua senha atual para alterar o e-mail.';
    }

    return errors;
}

function validatePasswordForm(
    currentPassword: string,
    newPassword: string,
    passwordConfirmation: string
): PasswordFormErrors {
    const errors: PasswordFormErrors = {};

    if (!currentPassword) {
        errors.currentPassword = 'Informe sua senha atual.';
    }
    if (!newPassword) {
        errors.newPassword = 'Informe a nova senha.';
    } else if (newPassword.length < 6) {
        errors.newPassword = 'A nova senha deve conter no mínimo 6 caracteres.';
    } else if (newPassword === currentPassword) {
        errors.newPassword = 'A nova senha deve ser diferente da senha atual.';
    }
    if (!passwordConfirmation) {
        errors.passwordConfirmation = 'Confirme a nova senha.';
    } else if (passwordConfirmation !== newPassword) {
        errors.passwordConfirmation = 'A confirmação deve ser igual à nova senha.';
    }

    return errors;
}

function ProfilePage() {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profileCurrentPassword, setProfileCurrentPassword] = useState('');
    const [profileFormErrors, setProfileFormErrors] = useState<ProfileFormErrors>({});
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [profileErrorMessage, setProfileErrorMessage] = useState<string | null>(null);
    const [profileSuccessMessage, setProfileSuccessMessage] = useState<string | null>(null);

    const [passwordCurrentPassword, setPasswordCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [passwordFormErrors, setPasswordFormErrors] = useState<PasswordFormErrors>({});
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState<string | null>(null);
    const [passwordSuccessMessage, setPasswordSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const abortController = new AbortController();

        async function loadProfile() {
            try {
                setIsLoading(true);
                setLoadErrorMessage(null);

                const authenticatedUser = await findMe(abortController.signal);
                setUser(authenticatedUser);
                setName(authenticatedUser.name);
                setEmail(authenticatedUser.email);
            } catch (error) {
                if (!axios.isCancel(error)) {
                    setUser(null);
                    setLoadErrorMessage(
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

    async function handleProfileSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!user) {
            return;
        }

        const normalizedName = name.trim();
        const normalizedEmail = email.trim();
        const emailChanged = normalizedEmail !== user.email;
        const validationErrors = validateProfileForm(
            normalizedName,
            normalizedEmail,
            profileCurrentPassword,
            emailChanged
        );

        if (Object.keys(validationErrors).length > 0) {
            setProfileFormErrors(validationErrors);
            setProfileErrorMessage(null);
            setProfileSuccessMessage(null);
            return;
        }

        try {
            setIsUpdatingProfile(true);
            setProfileFormErrors({});
            setProfileErrorMessage(null);
            setProfileSuccessMessage(null);

            const updatedUser = await updateMe({
                name: normalizedName,
                email: normalizedEmail,
                currentPassword: emailChanged
                    ? profileCurrentPassword
                    : null,
            });

            setUser(updatedUser);
            setName(updatedUser.name);
            setEmail(updatedUser.email);
            setProfileCurrentPassword('');
            setProfileSuccessMessage('Dados atualizados com sucesso.');
        } catch (error) {
            setProfileErrorMessage(
                getApiErrorMessage(error, 'Não foi possível atualizar seus dados.')
            );
        } finally {
            setIsUpdatingProfile(false);
        }
    }

    async function handlePasswordSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const validationErrors = validatePasswordForm(
            passwordCurrentPassword,
            newPassword,
            passwordConfirmation
        );

        if (Object.keys(validationErrors).length > 0) {
            setPasswordFormErrors(validationErrors);
            setPasswordErrorMessage(null);
            setPasswordSuccessMessage(null);
            return;
        }

        try {
            setIsChangingPassword(true);
            setPasswordFormErrors({});
            setPasswordErrorMessage(null);
            setPasswordSuccessMessage(null);

            await changePassword({
                currentPassword: passwordCurrentPassword,
                newPassword,
            });

            setPasswordCurrentPassword('');
            setNewPassword('');
            setPasswordConfirmation('');
            setPasswordSuccessMessage('Senha alterada com sucesso.');
        } catch (error) {
            setPasswordErrorMessage(
                getApiErrorMessage(error, 'Não foi possível alterar sua senha.')
            );
        } finally {
            setIsChangingPassword(false);
        }
    }

    if (isLoading) {
        return (
            <p className="mx-auto max-w-7xl px-4 py-6">
                Carregando seu perfil...
            </p>
        );
    }

    if (loadErrorMessage || !user) {
        return (
            <main className="mx-auto max-w-7xl px-4 py-6">
                <h1 className="mb-6">Meu perfil</h1>
                <p role="alert">
                    {loadErrorMessage ?? 'Não foi possível carregar seu perfil.'}
                </p>
            </main>
        );
    }

    const emailChanged = email.trim() !== user.email;

    return (
        <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6">
            <h1>Meu perfil</h1>

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

            <section className="max-w-2xl rounded-md border p-4">
                <h2 className="mb-4">Alterar dados</h2>

                <form className="flex flex-col gap-4" onSubmit={handleProfileSubmit} noValidate>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="profile-name">Nome</label>
                        <input
                            className="w-full"
                            id="profile-name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            value={name}
                            onChange={(event) => {
                                setName(event.target.value);
                                setProfileFormErrors((current) => ({
                                    ...current,
                                    name: undefined,
                                }));
                            }}
                            aria-invalid={Boolean(profileFormErrors.name)}
                            aria-describedby={profileFormErrors.name ? 'profile-name-error' : undefined}
                            disabled={isUpdatingProfile}
                        />
                        {profileFormErrors.name && (
                            <p id="profile-name-error">{profileFormErrors.name}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="profile-email">E-mail</label>
                        <input
                            className="w-full"
                            id="profile-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);
                                setProfileFormErrors((current) => ({
                                    ...current,
                                    email: undefined,
                                }));
                            }}
                            aria-invalid={Boolean(profileFormErrors.email)}
                            aria-describedby={profileFormErrors.email ? 'profile-email-error' : undefined}
                            disabled={isUpdatingProfile}
                        />
                        {profileFormErrors.email && (
                            <p id="profile-email-error">{profileFormErrors.email}</p>
                        )}
                    </div>

                    {emailChanged && (
                        <div className="flex flex-col gap-1">
                            <label htmlFor="profile-current-password">
                                Senha atual para confirmar o novo e-mail
                            </label>
                            <input
                                className="w-full"
                                id="profile-current-password"
                                name="currentPassword"
                                type="password"
                                autoComplete="current-password"
                                value={profileCurrentPassword}
                                onChange={(event) => {
                                    setProfileCurrentPassword(event.target.value);
                                    setProfileFormErrors((current) => ({
                                        ...current,
                                        currentPassword: undefined,
                                    }));
                                }}
                                aria-invalid={Boolean(profileFormErrors.currentPassword)}
                                aria-describedby={profileFormErrors.currentPassword ? 'profile-current-password-error' : undefined}
                                disabled={isUpdatingProfile}
                            />
                            {profileFormErrors.currentPassword && (
                                <p id="profile-current-password-error">
                                    {profileFormErrors.currentPassword}
                                </p>
                            )}
                        </div>
                    )}

                    {profileErrorMessage && <p role="alert">{profileErrorMessage}</p>}
                    {profileSuccessMessage && <p role="status">{profileSuccessMessage}</p>}

                    <button className="self-start" type="submit" disabled={isUpdatingProfile}>
                        {isUpdatingProfile ? 'Salvando...' : 'Salvar alterações'}
                    </button>
                </form>
            </section>

            <section className="max-w-2xl rounded-md border p-4">
                <h2 className="mb-4">Alterar senha</h2>

                <form className="flex flex-col gap-4" onSubmit={handlePasswordSubmit} noValidate>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="password-current">Senha atual</label>
                        <input
                            className="w-full"
                            id="password-current"
                            name="currentPassword"
                            type="password"
                            autoComplete="current-password"
                            value={passwordCurrentPassword}
                            onChange={(event) => {
                                setPasswordCurrentPassword(event.target.value);
                                setPasswordFormErrors((current) => ({
                                    ...current,
                                    currentPassword: undefined,
                                }));
                            }}
                            aria-invalid={Boolean(passwordFormErrors.currentPassword)}
                            aria-describedby={passwordFormErrors.currentPassword ? 'password-current-error' : undefined}
                            disabled={isChangingPassword}
                        />
                        {passwordFormErrors.currentPassword && (
                            <p id="password-current-error">{passwordFormErrors.currentPassword}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="password-new">Nova senha</label>
                        <input
                            className="w-full"
                            id="password-new"
                            name="newPassword"
                            type="password"
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(event) => {
                                setNewPassword(event.target.value);
                                setPasswordFormErrors((current) => ({
                                    ...current,
                                    newPassword: undefined,
                                }));
                            }}
                            aria-invalid={Boolean(passwordFormErrors.newPassword)}
                            aria-describedby={passwordFormErrors.newPassword ? 'password-new-error' : undefined}
                            disabled={isChangingPassword}
                        />
                        {passwordFormErrors.newPassword && (
                            <p id="password-new-error">{passwordFormErrors.newPassword}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="password-confirmation">Confirmar nova senha</label>
                        <input
                            className="w-full"
                            id="password-confirmation"
                            name="passwordConfirmation"
                            type="password"
                            autoComplete="new-password"
                            value={passwordConfirmation}
                            onChange={(event) => {
                                setPasswordConfirmation(event.target.value);
                                setPasswordFormErrors((current) => ({
                                    ...current,
                                    passwordConfirmation: undefined,
                                }));
                            }}
                            aria-invalid={Boolean(passwordFormErrors.passwordConfirmation)}
                            aria-describedby={passwordFormErrors.passwordConfirmation ? 'password-confirmation-error' : undefined}
                            disabled={isChangingPassword}
                        />
                        {passwordFormErrors.passwordConfirmation && (
                            <p id="password-confirmation-error">
                                {passwordFormErrors.passwordConfirmation}
                            </p>
                        )}
                    </div>

                    {passwordErrorMessage && <p role="alert">{passwordErrorMessage}</p>}
                    {passwordSuccessMessage && <p role="status">{passwordSuccessMessage}</p>}

                    <button className="self-start" type="submit" disabled={isChangingPassword}>
                        {isChangingPassword ? 'Alterando...' : 'Alterar senha'}
                    </button>
                </form>
            </section>
        </main>
    );
}

export default ProfilePage;
