import { useState, type SubmitEvent } from 'react';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';
import { register } from '../services/authService';
import { Link } from 'react-router-dom';
import AuthGalleryLayout from '../layouts/AuthGalleryLayout';
import PasswordInput from '../components/PasswordInput';

interface RegisterFormErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

function getPasswordError(password: string): string | undefined {
    if (!password) return 'Informe sua senha.';
    if (password.length < 8 || password.length > 72) {
        return 'A senha deve ter de 8 a 72 caracteres.';
    }
    if (!/\p{Lu}/u.test(password)) {
        return 'Inclua pelo menos uma letra maiúscula.';
    }
    if (!/\p{Ll}/u.test(password)) {
        return 'Inclua pelo menos uma letra minúscula.';
    }
    if (!/[0-9]/.test(password)) {
        return 'Inclua pelo menos um número.';
    }
    if (!/[\p{P}\p{S}]/u.test(password)) {
        return 'Inclua pelo menos um caractere especial (ex.: !, @, #).';
    }
    if (new TextEncoder().encode(password).length > 72) {
        return 'Senha muito longa. Use uma senha mais curta.';
    }
}

function validateRegisterForm(
    name: string,
    email: string,
    password: string,
    confirmPassword: string
): RegisterFormErrors {
    const errors: RegisterFormErrors = {};
    const normalizedName = name.trim();
    const normalizedEmail = email.trim();

    if (!normalizedName) {
        errors.name = 'Informe seu nome.';
    }
    if (!normalizedEmail) {
        errors.email = 'Informe seu e-mail.';
    } else if (!normalizedEmail.includes('@')) {
        // inserir um regex de validação de e-mail
        errors.email = 'Informe um e-mail válido.';
    }
    const passwordError = getPasswordError(password);
    if (passwordError) errors.password = passwordError;
    if (!confirmPassword) {
        errors.confirmPassword = 'Confirme sua senha.';
    } else if (password !== confirmPassword) {
        errors.confirmPassword = 'As senhas devem ser iguais.';
    }

    return errors;
}

function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [formErrors, setFormErrors] = useState<RegisterFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const passwordError = password
        ? getPasswordError(password)
        : formErrors.password;

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const validationErrors = validateRegisterForm(
            name,
            email,
            password,
            confirmPassword
        );

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

            await register({
                name: name.trim(),
                email: email.trim(),
                password,
                confirmPassword,
            });

            setPassword('');
            setConfirmPassword('');

            setSuccessMessage('Cadastrado com sucesso!');
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, 'Falha no cadastro.'));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <AuthGalleryLayout>
            <section
                className="login-form-section"
                aria-labelledby="register-title"
            >
                <h1 id="register-title">Cadastrar</h1>

                <p className="login-description">Cadastre-se no LetterBooks.</p>

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                    noValidate
                    aria-busy={isSubmitting}
                >
                    <div className="login-field">
                        <label htmlFor="name">Nome</label>

                        <input
                            className="w-full"
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            value={name}
                            onChange={(event) => {
                                setName(event.target.value);

                                // apaga erro quando o usuario começa a digitar
                                setFormErrors((current) => ({
                                    ...current,
                                    name: undefined,
                                }));
                            }}
                            aria-invalid={Boolean(formErrors.name)}
                            aria-describedby={
                                formErrors.name ? 'name-error' : undefined
                            }
                            disabled={isSubmitting}
                        />

                        {formErrors.name && (
                            <p id="name-error" role="alert">
                                {formErrors.name}
                            </p>
                        )}
                    </div>

                    <div className="login-field">
                        <label htmlFor="email">E-mail</label>

                        <input
                            className="w-full"
                            id="email"
                            name="email"
                            type="email"
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
                            autoComplete="new-password"
                            value={password}
                            onChange={(event) => {
                                setPassword(event.target.value);

                                setFormErrors((current) => ({
                                    ...current,
                                    password: undefined,
                                    confirmPassword: undefined,
                                }));
                            }}
                            aria-invalid={Boolean(passwordError)}
                            aria-describedby={
                                passwordError ? 'password-error' : undefined
                            }
                            disabled={isSubmitting}
                        />

                        {passwordError && (
                            <p
                                className="register-password-error"
                                id="password-error"
                                role="alert"
                            >
                                {passwordError}
                            </p>
                        )}
                    </div>

                    <div className="login-field">
                        <label htmlFor="confirmPassword">
                            Confirme sua senha
                        </label>
                        <PasswordInput
                            visibilityLabel="confirmação de senha"
                            id="confirmPassword"
                            name="confirmPassword"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(event) => {
                                setConfirmPassword(event.target.value);
                                setFormErrors((current) => ({
                                    ...current,
                                    confirmPassword: undefined,
                                }));
                            }}
                            aria-invalid={Boolean(formErrors.confirmPassword)}
                            aria-describedby={
                                formErrors.confirmPassword
                                    ? 'confirm-password-error'
                                    : undefined
                            }
                            disabled={isSubmitting}
                        />
                        {formErrors.confirmPassword && (
                            <p id="confirm-password-error" role="alert">
                                {formErrors.confirmPassword}
                            </p>
                        )}
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
                        {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                </form>
                <p className="login-register">
                    Já possui uma conta? <Link to="/login">Entrar</Link>
                </p>
            </section>
        </AuthGalleryLayout>
    );
}

export default RegisterPage;
