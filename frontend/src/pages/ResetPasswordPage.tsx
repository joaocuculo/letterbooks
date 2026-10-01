import { useState, type SubmitEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';

interface ResetPasswordFormErrors {
    newPassword?: string;
    passwordConfirmation?: string;
}

function validatePassword(
    newPassword: string,
    passwordConfirmation: string
): ResetPasswordFormErrors {
    const errors: ResetPasswordFormErrors = {};

    if (!newPassword) {
        errors.newPassword = 'Informe a nova senha.';
    } else if (newPassword.length < 6) {
        errors.newPassword = 'A nova senha deve conter no mínimo 6 caracteres.';
    }

    if (!passwordConfirmation) {
        errors.passwordConfirmation = 'Confirme a nova senha.';
    } else if (passwordConfirmation !== newPassword) {
        errors.passwordConfirmation = 'A confirmação deve ser igual à nova senha.';
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
                    successMessage: 'Senha redefinida com sucesso. Entre com sua nova senha.',
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
            <main className="mx-auto w-full max-w-md px-4 py-8">
                <section className="flex flex-col gap-4">
                    <h1>Redefinir senha</h1>
                    <p role="alert">Link de recuperação inválido ou expirado.</p>
                    <Link to="/forgot-password">Solicitar um novo link</Link>
                </section>
            </main>
        );
    }

    return (
        <main className="mx-auto w-full max-w-md px-4 py-8">
            <section className="flex flex-col gap-4">
                <h1>Redefinir senha</h1>

                <p>Informe e confirme sua nova senha.</p>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="new-password">Nova senha</label>
                        <input
                            className="w-full"
                            id="new-password"
                            name="newPassword"
                            type="password"
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(event) => {
                                setNewPassword(event.target.value);
                                setFormErrors((current) => ({
                                    ...current,
                                    newPassword: undefined,
                                }));
                            }}
                            aria-invalid={Boolean(formErrors.newPassword)}
                            aria-describedby={formErrors.newPassword ? 'new-password-error' : undefined}
                            disabled={isSubmitting}
                        />

                        {formErrors.newPassword && (
                            <p id="new-password-error">{formErrors.newPassword}</p>
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
                                setFormErrors((current) => ({
                                    ...current,
                                    passwordConfirmation: undefined,
                                }));
                            }}
                            aria-invalid={Boolean(formErrors.passwordConfirmation)}
                            aria-describedby={formErrors.passwordConfirmation ? 'password-confirmation-error' : undefined}
                            disabled={isSubmitting}
                        />

                        {formErrors.passwordConfirmation && (
                            <p id="password-confirmation-error">
                                {formErrors.passwordConfirmation}
                            </p>
                        )}
                    </div>

                    {errorMessage && <p role="alert">{errorMessage}</p>}

                    <button className="self-start" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Redefinindo...' : 'Redefinir senha'}
                    </button>
                </form>

                <Link to="/forgot-password">Solicitar um novo link</Link>
            </section>
        </main>
    );
}

export default ResetPasswordPage;
