export function getPasswordError(password: string): string | undefined {
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
