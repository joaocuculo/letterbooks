import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useLibraryResource } from '../hooks/useLibraryResource';
import {
    addBooksToShelves,
    bulkMembershipSummary,
    listShelves,
    type BulkShelfResult,
} from '../services/bookshelfService';
import ShelfPickerDialog from './ShelfPickerDialog';
import ShelfEditor from './ShelfEditor';
import PaginationControls from './PaginationControls';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';

export default function BulkAddToShelfDialog({
    ids,
    onClose,
    onSaved,
    onBusyChange,
}: {
    ids: string[];
    onClose: () => void;
    onSaved: (result: BulkShelfResult) => void;
    onBusyChange: (busy: boolean) => void;
}) {
    const { user } = useAuth();
    const [page, setPage] = useState(0);
    const [revision, setRevision] = useState(0);
    const [selected, setSelected] = useState(new Set<number>());
    const selectedRef = useRef(selected);
    useEffect(() => {
        selectedRef.current = selected;
    }, [selected]);
    const [creating, setCreating] = useState(false);
    const [created, setCreated] = useState<{ id: number; name: string } | null>(
        null
    );
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [uncertain, setUncertain] = useState(false);
    const lock = useRef(false);
    const alive = useRef(true);
    useEffect(() => {
        alive.current = true;
        return () => {
            alive.current = false;
        };
    }, []);
    const load = useCallback(
        async (signal: AbortSignal) => {
            if (!user) throw new Error('Entre para organizar seus livros.');
            const list = await listShelves(user.id, page, signal);
            const currentIds = list.content.map((shelf) => shelf.id);
            // Recheck selected destinations too after an uncertain response, in chunks of 20.
            const allIds = uncertain
                ? [...new Set([...currentIds, ...selectedRef.current])]
                : currentIds;
            const counts = new Map<number, number>();
            for (let start = 0; start < allIds.length; start += 20) {
                const summary = await bulkMembershipSummary(
                    ids,
                    allIds.slice(start, start + 20),
                    signal
                );
                summary.shelves.forEach((shelf) =>
                    counts.set(shelf.bookshelfId, shelf.existingCount)
                );
            }
            return { list, counts };
        },
        [user, page, ids, uncertain]
    );
    const state = useLibraryResource(`bulk:${page}:${revision}`, load);
    const choices = [
        ...(created &&
        !state.data?.list.content.some((shelf) => shelf.id === created.id)
            ? [created]
            : []),
        ...(state.data?.list.content ?? []),
    ];
    async function submit() {
        if (lock.current || !selected.size || state.busy || state.error) return;
        lock.current = true;
        setBusy(true);
        onBusyChange(true);
        setError('');
        try {
            const result = await addBooksToShelves(ids, [...selected]);
            if (alive.current) onSaved(result);
        } catch (failure) {
            if (!alive.current) return;
            const unknown = axios.isAxiosError(failure) && !failure.response;
            setUncertain(unknown);
            setError(
                unknown
                    ? 'Não foi possível confirmar o resultado. Estamos atualizando as contagens antes de uma nova tentativa.'
                    : getApiErrorMessage(
                          failure,
                          'Não foi possível adicionar os livros. Nenhuma alteração do lote foi salva.'
                      )
            );
            setRevision((value) => value + 1);
        } finally {
            lock.current = false;
            if (alive.current) {
                setBusy(false);
                onBusyChange(false);
            }
        }
    }
    return (
        <ShelfPickerDialog
            heading="Adicionar livros às estantes"
            title={`${ids.length} ${ids.length === 1 ? 'livro selecionado' : 'livros selecionados'}`}
            actionLabel="Adicionar livros"
            selected={selected}
            choices={choices.map((shelf) => {
                const count = state.data?.counts.get(shelf.id) ?? 0;
                return {
                    ...shelf,
                    containsBook: count === ids.length,
                    description:
                        count === ids.length
                            ? 'Já contém todos os livros'
                            : `Já contém ${count} de ${ids.length}`,
                    disabled: selected.size >= 20 && !selected.has(shelf.id),
                };
            })}
            loading={state.busy}
            busy={busy}
            error={error}
            loadError={state.error || undefined}
            onRetry={() => setRevision((value) => value + 1)}
            createDisabled={selected.size >= 20 || state.busy}
            limitMessage={
                selected.size >= 20
                    ? 'Limite de 20 estantes por operação.'
                    : uncertain && !state.busy && !state.error
                      ? 'Contagens atualizadas. Você pode repetir a operação sem duplicar livros.'
                      : undefined
            }
            onClose={onClose}
            onCreate={() => setCreating(true)}
            onAdd={() => void submit()}
            onToggle={(id, checked) =>
                setSelected((previous) => {
                    const next = new Set(previous);
                    if (checked && next.size < 20) next.add(id);
                    else next.delete(id);
                    return next;
                })
            }
            pagination={
                state.data && (
                    <PaginationControls
                        page={page}
                        total={state.data.list.page.totalPages}
                        busy={busy || state.busy}
                        onChange={setPage}
                        label="Páginas de estantes"
                        className="shelf-picker-pagination"
                    />
                )
            }
        >
            {creating && (
                <ShelfEditor
                    onClose={() => setCreating(false)}
                    onSaved={(shelf) => {
                        setCreated(shelf);
                        setSelected(
                            (previous) => new Set([...previous, shelf.id])
                        );
                        setCreating(false);
                        setPage(0);
                        setRevision((value) => value + 1);
                    }}
                />
            )}
        </ShelfPickerDialog>
    );
}
