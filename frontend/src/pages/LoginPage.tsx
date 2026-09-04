import { useState } from "react";
import type { SubmitEvent } from "react";
import { getApiErrorMessage } from "../utils/getApiErrorMessage.";
import { login } from "../services/authService";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface LoginFormErrors {
    email?: string;
    password?: string;
}

function validateLoginForm(email: string, password: string): LoginFormErrors {
    const errors: LoginFormErrors = {};
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
        errors.email = 'Informe seu e-mail.';
    } else if (!normalizedEmail.includes('@')) { // inserir um regex de validação de e-mail
        errors.email = 'Informe um e-mail válido.';
    }

    if (!password) {
        errors.password = 'Informe sua senha.';
    }

    return errors;
}

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [formErrors, setFormErrors] = useState<LoginFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const { signIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const requestedPath = (location.state as { from?: unknown } | null)?.from;
    const destination =
        typeof requestedPath === 'string' &&
        requestedPath.startsWith('/') &&
        !requestedPath.startsWith('//')
            ? requestedPath
            : '/';

    async function handleSubmit(event:SubmitEvent<HTMLFormElement>) {
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
                password
            });

            signIn(token);
            setPassword("");
            navigate(destination, { replace: true });
        } catch (error) {
            setErrorMessage(
                getApiErrorMessage(
                    error,
                    "Não foi possível realizar o login",
                    {
                        401: "E-mail ou senha inválidos.",
                        403: "E-mail ou senha inválidos.",
                    }
                )
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="mx-auto w-full max-w-md px-4 py-8">
            <section className="flex flex-col gap-4">
                <h1>Entrar</h1>

                <p>Use seu e-mail e sua senha cadastrados no LetterBooks.</p>

                <form
                    className="flex flex-col gap-4"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <div className="flex flex-col gap-1">
                        <label htmlFor="email">
                            E-mail
                        </label>

                        <input className="w-full" type="email" id="email" name="email" autoComplete="email" value={email} onChange={(event) => {
                            setEmail(event.target.value);

                            setFormErrors((current) => ({
                                ...current,
                                email: undefined
                            }));
                        }} aria-invalid={Boolean(
                            formErrors.email
                        )} aria-describedby={
                            formErrors.email ? "email-error" : undefined
                        } disabled={isSubmitting}/>

                        {formErrors.email && (
                            <p id="email-error">{formErrors.email}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="password">
                            Senha
                        </label>

                        <input className="w-full" type="password" id="password" name="password" autoComplete="current-password" value={password} onChange={(event) => {
                            setPassword(event.target.value);

                            setFormErrors((current) => ({
                                ...current,
                                password: undefined
                            }));
                        }} aria-invalid={Boolean(
                            formErrors.password
                        )} aria-describedby={
                            formErrors.password ? "password-error" : undefined
                        } disabled={isSubmitting}/>

                        {formErrors.password && (
                            <p id="password-error">{formErrors.password}</p>
                        )}
                    </div>

                    {errorMessage && (
                        <p role="alert">{errorMessage}</p>
                    )}

                    {successMessage && (
                        <p role="status">{successMessage}</p>
                    )}

                    <button className="self-start" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Entrando..." : "Entrar"}
                    </button>
                </form>
                
                <span>Ainda não possui uma conta? <Link to="/register">Cadastre-se</Link></span>
            </section>
        </main>
    );
}

export default LoginPage;
