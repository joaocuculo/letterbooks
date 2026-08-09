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
        errors.email = 'Informe um e-mail válido.';
    }

    if (!password) {
        errors.password = 'Informe sua senha.';
    }

    return errors;
}

function LoginPage() {
    return '';
}

export default LoginPage;
