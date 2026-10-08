import { useState, type SubmitEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';
import AuthGalleryLayout from '../layouts/AuthGalleryLayout';
import PasswordInput from '../components/PasswordInput';
import { getPasswordError } from '../utils/getPasswordError';

interface ResetPasswordFormErrors {
    newPassword?: string;
    passwordConfirmation?: string;
}

function validatePassword(
    newPassword: string,
    passwordConfirmation: string
): ResetPasswordFormErrors {
    const errors: ResetPasswordFormErrors = {};

    const passwordError = newPassword
        ? getPasswordError(newPassword)
        : 'Informe a nova senha.';
    if (passwordError) errors.newPassword = passwordError;

    if (!passwordConfirmation) {
        errors.passwordConfirmation = 'Confirme a nova senha.';
    } else if (passwordConfirmation !== newPassword) {
        errors.passwordConfirmation =
            'A confirmação deve ser igual à nova senha.';
    }

    return errors;
}

function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token')?.trim() ?? '';

    const [newPassword, setNewPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [formErrors, setFormErrors] = useState<ResetPasswordFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const passwordError = newPassword
        ? getPasswordError(newPassword)
        : formErrors.newPassword;

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!token) {
            setErrorMessage('Link de recuperação inválido ou expirado.');
            return;
        }

        const validationErrors = validatePassword(
            newPassword,
            passwordConfirmation
        );

        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors);
            setErrorMessage(null);
            return;
        }

        try {
            setIsSubmitting(true);
            setFormErrors({});
            setErrorMessage(null);

            await resetPassword({ token, newPassword });

            navigate('/login', {
                replace: true,
                state: {
                    successMessage:
                        'Senha redefinida com sucesso. Entre com sua nova senha.',
                },
            });
        } catch (error) {
            setErrorMessage(
                getApiErrorMessage(
                    error,
                    'Não foi possível redefinir sua senha.',
                    {
                        401: 'Link de recuperação inválido ou expirado.',
                    }
                )
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!token) {
        return (
            <AuthGalleryLayout variant="recovery">
                <section
                    className="login-form-section"
                    aria-labelledby="reset-title"
                >
                    <h1 id="reset-title">Redefinir senha</h1>
                    <p className="login-message" role="alert">
                        Link de recuperação inválido ou expirado.
                    </p>
                    <p className="login-register">
                        <Link to="/forgot-password">
                            Solicitar um novo link
                        </Link>
                    </p>
                </section>
            </AuthGalleryLayout>
        );
    }

    return (
        <AuthGalleryLayout variant="recovery">
            <section
                className="login-form-section"
                aria-labelledby="reset-title"
            >
                <h1 id="reset-title">Redefinir senha</h1>

                <p className="login-description">
                    Informe e confirme sua nova senha.
                </p>

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                    noValidate
                    aria-busy={isSubmitting}
                >
                    <div className="login-field">
                        <label htmlFor="new-password">Nova senha</label>
                        <PasswordInput
                            visibilityLabel="nova senha"
                            className="w-full"
                            id="new-password"
                            name="newPassword"
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(event) => {
                                setNewPassword(event.target.value);
                                setFormErrors((current) => ({
                                    ...current,
                                    newPassword: undefined,
                                }));
                            }}
                            aria-invalid={Boolean(passwordError)}
                            aria-describedby={
                                passwordError ? 'new-password-error' : undefined
                            }
                            disabled={isSubmitting}
                        />

                        {passwordError && (
                            <p id="new-password-error" role="alert">
                                {passwordError}
                            </p>
                        )}
                    </div>

                    <div className="login-field">
                        <label htmlFor="password-confirmation">
                            Confirmar nova senha
                        </label>
                        <PasswordInput
                            visibilityLabel="confirmação da nova senha"
                            className="w-full"
                            id="password-confirmation"
                            name="passwordConfirmation"
                            autoComplete="new-password"
                            value={passwordConfirmation}
                            onChange={(event) => {
                                setPasswordConfirmation(event.target.value);
                                setFormErrors((current) => ({
                                    ...current,
                                    passwordConfirmation: undefined,
                                }));
                            }}
                            aria-invalid={Boolean(
                                formErrors.passwordConfirmation
                            )}
                            aria-describedby={
                                formErrors.passwordConfirmation
                                    ? 'password-confirmation-error'
                                    : undefined
                            }
                            disabled={isSubmitting}
                        />

                        {formErrors.passwordConfirmation && (
                            <p id="password-confirmation-error" role="alert">
                                {formErrors.passwordConfirmation}
                            </p>
                        )}
                    </div>

                    {errorMessage && (
                        <p className="login-message" role="alert">
                            {errorMessage}
                        </p>
                    )}

                    <button
                        className="login-submit"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Redefinindo...' : 'Redefinir senha'}
                    </button>
                </form>

                <p className="login-register">
                    <Link to="/forgot-password">Solicitar um novo link</Link>
                </p>
            </section>
        </AuthGalleryLayout>
    );
}

export default ResetPasswordPage;
