import { useState, type SubmitEvent } from "react";
import { getApiErrorMessage } from "../utils/getApiErrorMessage.";
import { register } from "../services/authService";
import { Link } from "react-router-dom";

interface RegisterFormErrors {
    name?: string;
    email?: string;
    password?: string;
}

function validateRegisterForm(name: string, email: string, password: string): RegisterFormErrors {
    const errors: RegisterFormErrors = {};
    const normalizedName = name.trim();
    const normalizedEmail = email.trim();

    if (!normalizedName) {
        errors.name = "Informe seu nome.";
    }
    if (!normalizedEmail) {
        errors.email = "Informe seu e-mail.";
    } else if (!normalizedEmail.includes("@")) { // inserir um regex de validação de e-mail
        errors.email = "Informe um e-mail válido.";
    }
    if (!password) {
        errors.password = "Informe sua senha.";
    } else if (password.length < 6) {
        errors.password = "A senha deve conter no mínimo 6 caracteres.";
    }

    return errors;
}

function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [formErrors, setFormErrors] = useState<RegisterFormErrors>({});   
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    async function handleSubmit(event:SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const validationErrors = validateRegisterForm(name, email, password);

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
                password
            })

            setPassword("");

            setSuccessMessage("Cadastrado com sucesso!");
        } catch (error) {
            setErrorMessage(
                getApiErrorMessage(
                    error,
                    "Falha no cadastro."
                )
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div>
            <section>
                <h1>
                    Cadastrar
                </h1>

                <p>
                    Cadastre-se no LetterBooks.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                    <div>
                        <label htmlFor="name">
                            Nome
                        </label>

                        <input 
                            id="name"
                            name="name" 
                            type="text"
                            autoComplete="name"
                            value={name}
                            onChange={(event) => {
                                setName(event.target.value);

                                // apaga erro quando o usuario começa a digitar
                                setFormErrors((current) =>({
                                    ...current,
                                    name: undefined
                                }));
                            }}
                            aria-invalid={Boolean(
                                formErrors.name
                            )}
                            aria-describedby={
                                formErrors.name
                                    ? "name-error"
                                    : undefined
                            }
                            disabled={isSubmitting}
                        />

                        {formErrors.name && (
                            <p id="name-error">
                                {formErrors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email">
                            E-mail
                        </label>

                        <input 
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);

                                setFormErrors((current) =>({
                                    ...current,
                                    email: undefined
                                }));
                            }}
                            aria-invalid={Boolean(
                                formErrors.email
                            )}
                            aria-describedby={
                                formErrors.email
                                    ? "email-error"
                                    : undefined
                            }
                            disabled={isSubmitting}
                        />

                        {formErrors.email && (
                            <p id="email-error">
                                {formErrors.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                        >
                            Senha
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(event) => {
                                setPassword(event.target.value);

                                setFormErrors((current) => ({
                                    ...current,
                                    password: undefined,
                                }));
                            }}
                            aria-invalid={Boolean(
                                formErrors.password,
                            )}
                            aria-describedby={
                                formErrors.password
                                    ? "password-error"
                                    : undefined
                            }
                            disabled={isSubmitting}
                        />

                        {formErrors.password && (
                            <p id="password-error">
                                {formErrors.password}
                            </p>
                        )}
                    </div>

                    {errorMessage && (
                        <p role="alert">
                            {errorMessage}
                        </p>
                    )}

                    {successMessage && (
                        <p role="alert">
                            {successMessage}
                        </p>
                    )}

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting
                            ? "Cadastrando..."
                            : "Cadastrar"
                        }
                    </button>
                </form>
                <span>Já possui uma conta? <Link to="/login">Entrar</Link></span>
            </section>
        </div>
    );
}

export default RegisterPage;