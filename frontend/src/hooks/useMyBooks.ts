import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { findMine, update, remove } from '../services/userBookService';
import type {
    UserBookResponse,
    UserBookFilters,
    UserBookUpdate,
} from '../types/userBook';
import type { PageResponse } from '../types/page';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';

export interface LibraryQuery {
    key: string;
    filters: UserBookFilters;
}
interface LibraryState {
    data: PageResponse<UserBookResponse> | null;
    busy: boolean;
    error: string;
    filters: UserBookFilters;
}
function belongs(book: UserBookResponse, filters: UserBookFilters) {
    return (
        (!filters.status || book.status === filters.status) &&
        (filters.favorite === undefined || book.isFavorite === filters.favorite)
    );
}
export function useMyBooks(
    queries: LibraryQuery[],
    onPageUnavailable: (page: number) => void
) {
    const [states, setStates] = useState<Record<string, LibraryState>>({});
    const [pending, setPending] = useState<Record<number, boolean>>({});
    const [errors, setErrors] = useState<Record<number, string>>({});
    const [success, setSuccess] = useState('');
    const controllers = useRef(new Map<string, AbortController>());
    const generation = useRef(0);
    const queriesRef = useRef(queries);
    const pageUnavailableRef = useRef(onPageUnavailable);
    useEffect(() => {
        queriesRef.current = queries;
        pageUnavailableRef.current = onPageUnavailable;
    }, [queries, onPageUnavailable]);
    const reload = useCallback(async (key: string) => {
        const query = queriesRef.current.find((item) => item.key === key);
        if (!query) return;
        controllers.current.get(key)?.abort();
        const controller = new AbortController();
        controllers.current.set(key, controller);
        const currentGeneration = generation.current;
        setStates((previous) => ({
            ...previous,
            [key]: {
                filters: query.filters,
                data:
                    JSON.stringify(previous[key]?.filters) ===
                    JSON.stringify(query.filters)
                        ? (previous[key]?.data ?? null)
                        : null,
                busy: true,
                error: '',
            },
        }));
        try {
            const data = await findMine(query.filters, controller.signal);
            if (
                controller.signal.aborted ||
                currentGeneration !== generation.current
            )
                return;
            setStates((previous) => ({
                ...previous,
                [key]: { data, filters: query.filters, busy: false, error: '' },
            }));
            if (
                key === 'active' &&
                (query.filters.page ?? 0) > 0 &&
                (query.filters.page ?? 0) >= data.page.totalPages
            )
                pageUnavailableRef.current(
                    Math.max(0, data.page.totalPages - 1)
                );
        } catch (error) {
            if (
                controller.signal.aborted ||
                currentGeneration !== generation.current ||
                axios.isCancel(error)
            )
                return;
            setStates((previous) => ({
                ...previous,
                [key]: {
                    ...previous[key],
                    busy: false,
                    error: getApiErrorMessage(
                        error,
                        'Não foi possível carregar seus livros.'
                    ),
                },
            }));
        }
    }, []);
    useEffect(() => {
        for (const query of queries) void reload(query.key);
        const activeControllers = controllers.current;
        const currentGeneration = generation.current;
        return () => {
            generation.current = currentGeneration + 1;
            activeControllers.forEach((controller) => controller.abort());
            activeControllers.clear();
        };
    }, [queries, reload]);
    const mutationLocks = useRef(new Set<number>());
    const mounted = useRef(true);
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);
    async function mutate(
        book: UserBookResponse,
        change: UserBookUpdate | null
    ): Promise<boolean> {
        if (mutationLocks.current.has(book.id)) return false;
        mutationLocks.current.add(book.id);
        setPending((previous) => ({ ...previous, [book.id]: true }));
        setErrors((previous) => ({ ...previous, [book.id]: '' }));
        setSuccess('');
        try {
            let result: UserBookResponse | null = null;
            if (change) result = await update(book.id, change);
            else await remove(book.id);
            if (!mounted.current) return true;
            setStates((previous) =>
                Object.fromEntries(
                    Object.entries(previous).map(([key, state]) => {
                        if (!state.data) return [key, state];
                        const before = belongs(book, state.filters);
                        const after = Boolean(
                            result && belongs(result, state.filters)
                        );
                        const totalElements = Math.max(
                            0,
                            state.data.page.totalElements +
                                Number(after) -
                                Number(before)
                        );
                        return [
                            key,
                            {
                                ...state,
                                data: {
                                    ...state.data,
                                    content: state.data.content.flatMap(
                                        (item) =>
                                            item.id !== book.id
                                                ? [item]
                                                : after && result
                                                  ? [result]
                                                  : []
                                    ),
                                    page: {
                                        ...state.data.page,
                                        totalElements,
                                        totalPages: Math.ceil(
                                            totalElements / state.data.page.size
                                        ),
                                    },
                                },
                            },
                        ];
                    })
                )
            );
            setSuccess(
                change
                    ? 'Livro atualizado.'
                    : 'Livro removido da sua biblioteca.'
            );
            for (const query of queriesRef.current)
                if (
                    query.key === 'active' ||
                    belongs(book, query.filters) ||
                    (result && belongs(result, query.filters))
                )
                    void reload(query.key);
            return true;
        } catch (error) {
            if (mounted.current)
                setErrors((previous) => ({
                    ...previous,
                    [book.id]: getApiErrorMessage(
                        error,
                        change
                            ? 'Não foi possível atualizar este livro.'
                            : 'Não foi possível remover este livro.'
                    ),
                }));
            return false;
        } finally {
            mutationLocks.current.delete(book.id);
            if (mounted.current)
                setPending((previous) => ({ ...previous, [book.id]: false }));
        }
    }
    return { states, pending, errors, success, reload, mutate };
}
