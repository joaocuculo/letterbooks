import type { ReactNode } from 'react';
import SiteHeader from '../components/SiteHeader';
import PasswordInput from '../components/PasswordInput';
import { useAuth } from '../hooks/useAuth';
import { getPasswordError } from '../utils/getPasswordError';
import '../styles/profile.css';
import axios from 'axios';
import { useEffect, useState, type SubmitEvent } from 'react';
import { changePassword, findMe, updateMe } from '../services/userService';
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
        errors.currentPassword =
            'Informe sua senha atual para alterar o e-mail.';
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
    } else if (getPasswordError(newPassword)) {
        errors.newPassword = getPasswordError(newPassword);
    } else if (newPassword === currentPassword) {
        errors.newPassword = 'A nova senha deve ser diferente da senha atual.';
    }
    if (!passwordConfirmation) {
        errors.passwordConfirmation = 'Confirme a nova senha.';
    } else if (passwordConfirmation !== newPassword) {
        errors.passwordConfirmation =
            'A confirmação deve ser igual à nova senha.';
    }

    return errors;
}

function ProfileShell({ children }: { children: ReactNode }) {
    return (
        <div className="landing profile-page">
            <a className="landing-skip" href="#profile-content">
                Pular para o conteúdo
            </a>
            <SiteHeader />
            <main id="profile-content" className="profile-content">
                <h1>Meu perfil</h1>
                {children}
            </main>
        </div>
    );
}

function ProfilePage() {
    const { refreshUser } = useAuth();
    const [loadAttempt, setLoadAttempt] = useState(0);
    const [user, setUser] = useState<UserResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(
        null
    );

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profileCurrentPassword, setProfileCurrentPassword] = useState('');
    const [profileFormErrors, setProfileFormErrors] =
        useState<ProfileFormErrors>({});
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [profileErrorMessage, setProfileErrorMessage] = useState<
        string | null
    >(null);
    const [profileSuccessMessage, setProfileSuccessMessage] = useState<
        string | null
    >(null);

    const [passwordCurrentPassword, setPasswordCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [passwordFormErrors, setPasswordFormErrors] =
        useState<PasswordFormErrors>({});
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState<
        string | null
    >(null);
    const [passwordSuccessMessage, setPasswordSuccessMessage] = useState<
        string | null
    >(null);

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
    }, [loadAttempt]);

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
                currentPassword: emailChanged ? profileCurrentPassword : null,
            });

            setUser(updatedUser);
            refreshUser();
            setName(updatedUser.name);
            setEmail(updatedUser.email);
            setProfileCurrentPassword('');
            setProfileSuccessMessage('Dados atualizados com sucesso.');
        } catch (error) {
            setProfileErrorMessage(
                getApiErrorMessage(
                    error,
                    'Não foi possível atualizar seus dados.'
                )
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
            <ProfileShell>
                <p role="status" className="profile-loading">
                    Carregando seu perfil...
                </p>
            </ProfileShell>
        );
    }
    if (loadErrorMessage || !user) {
        return (
            <ProfileShell>
                <div className="profile-load-error">
                    <p className="login-message" role="alert">
                        {loadErrorMessage ??
                            'Não foi possível carregar seu perfil.'}
                    </p>
                    <button
                        className="login-submit"
                        onClick={() => setLoadAttempt((value) => value + 1)}
                    >
                        Tentar novamente
                    </button>
                </div>
            </ProfileShell>
        );
    }

    const emailChanged = email.trim() !== user.email;
    const initials =
        user.name
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join('')
            .toLocaleUpperCase('pt-BR') || 'LB';
    const newPasswordError = newPassword
        ? (getPasswordError(newPassword) ?? passwordFormErrors.newPassword)
        : passwordFormErrors.newPassword;

    return (
        <ProfileShell>
            <div className="profile-grid">
                <aside
                    className="profile-summary"
                    aria-labelledby="profile-summary-name"
                >
                    <div className="profile-avatar" aria-hidden="true">
                        {initials}
                    </div>
                    <h2 id="profile-summary-name">{user.name}</h2>
                    <p className="profile-summary-email">{user.email}</p>
                    <dl>
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
                </aside>
                <div className="profile-forms">
                    <section className="profile-section">
                        <h2 className="profile-section-title">
                            Dados pessoais
                        </h2>

                        <form
                            className="login-form"
                            aria-busy={isUpdatingProfile}
                            onSubmit={handleProfileSubmit}
                            noValidate
                        >
                            <div className="login-field">
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
                                    aria-invalid={Boolean(
                                        profileFormErrors.name
                                    )}
                                    aria-describedby={
                                        profileFormErrors.name
                                            ? 'profile-name-error'
                                            : undefined
                                    }
                                    disabled={isUpdatingProfile}
                                />
                                {profileFormErrors.name && (
                                    <p role="alert" id="profile-name-error">
                                        {profileFormErrors.name}
                                    </p>
                                )}
                            </div>

                            <div className="login-field">
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
                                    aria-invalid={Boolean(
                                        profileFormErrors.email
                                    )}
                                    aria-describedby={
                                        profileFormErrors.email
                                            ? 'profile-email-error'
                                            : undefined
                                    }
                                    disabled={isUpdatingProfile}
                                />
                                {profileFormErrors.email && (
                                    <p role="alert" id="profile-email-error">
                                        {profileFormErrors.email}
                                    </p>
                                )}
                            </div>

                            {emailChanged && (
                                <div className="login-field">
                                    <label htmlFor="profile-current-password">
                                        Senha atual para confirmar o novo e-mail
                                    </label>
                                    <PasswordInput
                                        className="w-full"
                                        id="profile-current-password"
                                        name="currentPassword"
                                        visibilityLabel="senha atual para confirmar o novo e-mail"
                                        autoComplete="current-password"
                                        value={profileCurrentPassword}
                                        onChange={(event) => {
                                            setProfileCurrentPassword(
                                                event.target.value
                                            );
                                            setProfileFormErrors((current) => ({
                                                ...current,
                                                currentPassword: undefined,
                                            }));
                                        }}
                                        aria-invalid={Boolean(
                                            profileFormErrors.currentPassword
                                        )}
                                        aria-describedby={
                                            profileFormErrors.currentPassword
                                                ? 'profile-current-password-error'
                                                : undefined
                                        }
                                        disabled={isUpdatingProfile}
                                    />
                                    {profileFormErrors.currentPassword && (
                                        <p
                                            role="alert"
                                            id="profile-current-password-error"
                                        >
                                            {profileFormErrors.currentPassword}
                                        </p>
                                    )}
                                </div>
                            )}

                            {profileErrorMessage && (
                                <p className="login-message" role="alert">
                                    {profileErrorMessage}
                                </p>
                            )}
                            {profileSuccessMessage && (
                                <p className="login-message" role="status">
                                    {profileSuccessMessage}
                                </p>
                            )}

                            <button
                                className="login-submit profile-submit"
                                type="submit"
                                disabled={isUpdatingProfile}
                            >
                                {isUpdatingProfile
                                    ? 'Salvando...'
                                    : 'Salvar alterações'}
                            </button>
                        </form>
                    </section>

                    <section className="profile-section">
                        <h2 className="profile-section-title">Alterar senha</h2>

                        <form
                            className="login-form"
                            aria-busy={isChangingPassword}
                            onSubmit={handlePasswordSubmit}
                            noValidate
                        >
                            <div className="login-field">
                                <label htmlFor="password-current">
                                    Senha atual
                                </label>
                                <PasswordInput
                                    className="w-full"
                                    id="password-current"
                                    name="currentPassword"
                                    visibilityLabel="senha atual"
                                    autoComplete="current-password"
                                    value={passwordCurrentPassword}
                                    onChange={(event) => {
                                        setPasswordCurrentPassword(
                                            event.target.value
                                        );
                                        setPasswordFormErrors((current) => ({
                                            ...current,
                                            currentPassword: undefined,
                                        }));
                                    }}
                                    aria-invalid={Boolean(
                                        passwordFormErrors.currentPassword
                                    )}
                                    aria-describedby={
                                        passwordFormErrors.currentPassword
                                            ? 'password-current-error'
                                            : undefined
                                    }
                                    disabled={isChangingPassword}
                                />
                                {passwordFormErrors.currentPassword && (
                                    <p role="alert" id="password-current-error">
                                        {passwordFormErrors.currentPassword}
                                    </p>
                                )}
                            </div>

                            <div className="login-field">
                                <label htmlFor="password-new">Nova senha</label>
                                <PasswordInput
                                    className="w-full"
                                    id="password-new"
                                    name="newPassword"
                                    visibilityLabel="nova senha"
                                    autoComplete="new-password"
                                    value={newPassword}
                                    onChange={(event) => {
                                        setNewPassword(event.target.value);
                                        setPasswordFormErrors((current) => ({
                                            ...current,
                                            newPassword: undefined,
                                        }));
                                    }}
                                    aria-invalid={Boolean(newPasswordError)}
                                    aria-describedby={
                                        newPasswordError
                                            ? 'password-new-error'
                                            : undefined
                                    }
                                    disabled={isChangingPassword}
                                />
                                {newPasswordError && (
                                    <p role="alert" id="password-new-error">
                                        {newPasswordError}
                                    </p>
                                )}
                            </div>

                            <div className="login-field">
                                <label htmlFor="password-confirmation">
                                    Confirmar nova senha
                                </label>
                                <PasswordInput
                                    className="w-full"
                                    id="password-confirmation"
                                    name="passwordConfirmation"
                                    visibilityLabel="confirmação da nova senha"
                                    autoComplete="new-password"
                                    value={passwordConfirmation}
                                    onChange={(event) => {
                                        setPasswordConfirmation(
                                            event.target.value
                                        );
                                        setPasswordFormErrors((current) => ({
                                            ...current,
                                            passwordConfirmation: undefined,
                                        }));
                                    }}
                                    aria-invalid={Boolean(
                                        passwordFormErrors.passwordConfirmation
                                    )}
                                    aria-describedby={
                                        passwordFormErrors.passwordConfirmation
                                            ? 'password-confirmation-error'
                                            : undefined
                                    }
                                    disabled={isChangingPassword}
                                />
                                {passwordFormErrors.passwordConfirmation && (
                                    <p
                                        role="alert"
                                        id="password-confirmation-error"
                                    >
                                        {
                                            passwordFormErrors.passwordConfirmation
                                        }
                                    </p>
                                )}
                            </div>

                            {passwordErrorMessage && (
                                <p className="login-message" role="alert">
                                    {passwordErrorMessage}
                                </p>
                            )}
                            {passwordSuccessMessage && (
                                <p className="login-message" role="status">
                                    {passwordSuccessMessage}
                                </p>
                            )}

                            <button
                                className="login-submit profile-submit"
                                type="submit"
                                disabled={isChangingPassword}
                            >
                                {isChangingPassword
                                    ? 'Alterando...'
                                    : 'Alterar senha'}
                            </button>
                        </form>
                    </section>
                </div>
            </div>
        </ProfileShell>
    );
}

export default ProfilePage;
