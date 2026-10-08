import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';
import { login } from '../services/authService';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthGalleryLayout from '../layouts/AuthGalleryLayout';
import PasswordInput from '../components/PasswordInput';

interface LoginFormErrors {
    email?: string;
    password?: string;
}

function validateLoginForm(email: string, password: string): LoginFormErrors {
    const errors: LoginFormErrors = {};
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
        errors.email = 'Informe seu e-mail.';
    } else if (!normalizedEmail.includes('@')) {
        // inserir um regex de validação de e-mail
        errors.email = 'Informe um e-mail válido.';
    }

    if (!password) {
        errors.password = 'Informe sua senha.';
    }

    return errors;
}

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [formErrors, setFormErrors] = useState<LoginFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const location = useLocation();
    const locationState = location.state as {
        from?: unknown;
        successMessage?: unknown;
    } | null;
    const [successMessage, setSuccessMessage] = useState<string | null>(
        typeof locationState?.successMessage === 'string'
            ? locationState.successMessage
            : null
    );

    const { signIn } = useAuth();
    const navigate = useNavigate();

    const requestedPath = locationState?.from;
    const destination =
        typeof requestedPath === 'string' &&
        requestedPath.startsWith('/') &&
        !requestedPath.startsWith('//')
            ? requestedPath
            : '/';

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const validationErrors = validateLoginForm(email, password);

        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors);
            setErrorMessage(null);
            setSuccessMessage(null);
            return;
        }

        try {
            setIsSubmitting(true);
            setFormErrors({});
            setErrorMessage(null);
            setSuccessMessage(null);

            const { token } = await login({
                email: email.trim(),
                password,
            });

            signIn(token);
            setPassword('');
            navigate(destination, { replace: true });
        } catch (error) {
            setErrorMessage(
                getApiErrorMessage(error, 'Não foi possível realizar o login', {
                    401: 'E-mail ou senha inválidos.',
                    403: 'E-mail ou senha inválidos.',
                })
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <AuthGalleryLayout>
            <section
                className="login-form-section"
                aria-labelledby="login-title"
            >
                <h1 id="login-title">Entrar</h1>

                <p className="login-description">
                    Use seu e-mail e sua senha cadastrados no LetterBooks.
                </p>

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                    noValidate
                    aria-busy={isSubmitting}
                >
                    <div className="login-field">
                        <label htmlFor="email">E-mail</label>

                        <input
                            className="w-full"
                            type="email"
                            id="email"
                            name="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);

                                setFormErrors((current) => ({
                                    ...current,
                                    email: undefined,
                                }));
                            }}
                            aria-invalid={Boolean(formErrors.email)}
                            aria-describedby={
                                formErrors.email ? 'email-error' : undefined
                            }
                            disabled={isSubmitting}
                        />

                        {formErrors.email && (
                            <p id="email-error" role="alert">
                                {formErrors.email}
                            </p>
                        )}
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">Senha</label>

                        <PasswordInput
                            visibilityLabel="senha"
                            className="w-full"
                            id="password"
                            name="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) => {
                                setPassword(event.target.value);

                                setFormErrors((current) => ({
                                    ...current,
                                    password: undefined,
                                }));
                            }}
                            aria-invalid={Boolean(formErrors.password)}
                            aria-describedby={
                                formErrors.password
                                    ? 'password-error'
                                    : undefined
                            }
                            disabled={isSubmitting}
                        />

                        {formErrors.password && (
                            <p id="password-error" role="alert">
                                {formErrors.password}
                            </p>
                        )}

                        <Link className="login-forgot" to="/forgot-password">
                            Esqueci minha senha
                        </Link>
                    </div>

                    {errorMessage && (
                        <p className="login-message" role="alert">
                            {errorMessage}
                        </p>
                    )}

                    {successMessage && (
                        <p className="login-message" role="status">
                            {successMessage}
                        </p>
                    )}

                    <button
                        className="login-submit"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <p className="login-register">
                    Ainda não possui uma conta?{' '}
                    <Link to="/register">Cadastre-se</Link>
                </p>
            </section>
        </AuthGalleryLayout>
    );
}

export default LoginPage;
