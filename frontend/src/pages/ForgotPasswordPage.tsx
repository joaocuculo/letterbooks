import { useState, type SubmitEvent } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../services/authService';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';
import AuthGalleryLayout from '../layouts/AuthGalleryLayout';

interface ForgotPasswordFormErrors {
    email?: string;
}

function validateEmail(email: string): ForgotPasswordFormErrors {
    const errors: ForgotPasswordFormErrors = {};
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
        errors.email = 'Informe seu e-mail.';
    } else if (!normalizedEmail.includes('@')) {
        errors.email = 'Informe um e-mail válido.';
    }

    return errors;
}

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [formErrors, setFormErrors] = useState<ForgotPasswordFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const validationErrors = validateEmail(email);

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

            const response = await requestPasswordReset({
                email: email.trim(),
            });

            setSuccessMessage(response.message);
        } catch (error) {
            setErrorMessage(
                getApiErrorMessage(
                    error,
                    'Não foi possível processar a solicitação. Tente novamente.'
                )
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <AuthGalleryLayout variant="recovery">
            <section
                className="login-form-section"
                aria-labelledby="recovery-title"
            >
                <h1 id="recovery-title">Esqueci minha senha</h1>

                <p className="login-description">
                    Informe seu e-mail para receber as instruções de redefinição
                    de senha.
                </p>

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                    noValidate
                    aria-busy={isSubmitting}
                >
                    <div className="login-field">
                        <label htmlFor="recovery-email">E-mail</label>
                        <input
                            className="w-full"
                            id="recovery-email"
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
                                formErrors.email
                                    ? 'recovery-email-error'
                                    : undefined
                            }
                            disabled={isSubmitting}
                        />

                        {formErrors.email && (
                            <p id="recovery-email-error" role="alert">
                                {formErrors.email}
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
                        {isSubmitting ? 'Enviando...' : 'Enviar instruções'}
                    </button>
                </form>

                <p className="login-register">
                    <Link to="/login">Voltar para o login</Link>
                </p>
            </section>
        </AuthGalleryLayout>
    );
}

export default ForgotPasswordPage;
