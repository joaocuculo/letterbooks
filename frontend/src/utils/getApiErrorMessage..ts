import axios from 'axios';
import type { ApiErrorResponse } from '../types/apiError';

type StatusMessageOverrides = Partial<Record<number, string>>;

export function getApiErrorMessage(
    error: unknown,
    fallbackMessage: string,
    statusMessageOverrides: StatusMessageOverrides = {}
): string {
    if (!axios.isAxiosError<ApiErrorResponse>(error)) {
        return fallbackMessage;
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return 'A API demorou muito para responder. Tente novamente.';
    }

    if (!error.response) {
        return 'Não foi possível conectar com a API. Verifique se o backend está funcionando.';
    }

    const status = error.response.status;
    const backendMessage = error.response.data?.message;
    const overriddenMessage = statusMessageOverrides[status];

    if (overriddenMessage) {
        return overriddenMessage;
    }

    switch (status) {
        case 400:
            return backendMessage ?? 'Os dados enviados são inválidos';

        case 401:
            return 'Sua sessão é inválida ou expirou.';

        case 403:
            return (
                backendMessage ??
                'Você não tem permissão para realizar essa ação.'
            );

        case 404:
            return backendMessage ?? 'O recurso solicitado não foi encontrado.';

        case 409:
            return backendMessage ?? 'A operação viola uma regra do sistema.';

        case 502:
            return (
                backendMessage ??
                'O serviço externo de livros está temporariamente indisponível.'
            );
        default:
            if (status >= 500) {
                return 'O servidor encontrou um erro interno. Tente novamente mais tarde.';
            }
            return backendMessage ?? fallbackMessage;
    }
}
