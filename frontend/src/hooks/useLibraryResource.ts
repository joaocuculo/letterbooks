import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';

export function useLibraryResource<T>(
    key: string,
    load: (signal: AbortSignal) => Promise<T>
) {
    const [state, setState] = useState<{
        key: string;
        data: T | null;
        busy: boolean;
        error: string;
    }>({ key: '', data: null, busy: true, error: '' });
    useEffect(() => {
        const controller = new AbortController();
        void (async () => {
            setState((previous) => ({
                key,
                data: previous.key === key ? previous.data : null,
                busy: true,
                error: '',
            }));
            try {
                const data = await load(controller.signal);
                if (!controller.signal.aborted)
                    setState({ key, data, busy: false, error: '' });
            } catch (error) {
                if (!controller.signal.aborted)
                    setState((previous) => ({
                        ...previous,
                        busy: false,
                        error: getApiErrorMessage(
                            error,
                            'Não foi possível carregar. Tente novamente.'
                        ),
                    }));
            }
        })();
        return () => controller.abort();
    }, [key, load]);
    return state.key === key
        ? state
        : { key, data: null, busy: true, error: '' };
}
