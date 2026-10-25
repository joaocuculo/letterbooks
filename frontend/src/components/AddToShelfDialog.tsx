import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLibraryResource } from '../hooks/useLibraryResource';
import {
    listShelves,
    findMineByGoogleBooksId,
    addBookToShelves,
} from '../services/bookshelfService';
import ShelfEditor from './ShelfEditor';
import ShelfPickerDialog from './ShelfPickerDialog';
import PaginationControls from './PaginationControls';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';
import '../styles/my-books.css';

export default function AddToShelfDialog({
    book,
    onClose,
    onAdded,
}: {
    book: { googleBooksId: string; title: string };
    onClose: () => void;
    onAdded?: () => void;
}) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [page, setPage] = useState(0);
    const [retry, setRetry] = useState(0);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [creating, setCreating] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [created, setCreated] = useState<{ id: number; name: string } | null>(
        null
    );
    const load = useCallback(
        async (signal: AbortSignal) => {
            if (!user) return null;
            const [shelves, memberships] = await Promise.all([
                listShelves(user.id, page, signal),
                findMineByGoogleBooksId(book.googleBooksId, signal),
            ]);
            return { shelves, memberships };
        },
        [user, page, book.googleBooksId]
    );
    const state = useLibraryResource(
        `add:${page}:${retry}:${book.googleBooksId}`,
        load
    );
    const membership = new Set(state.data?.memberships.map((s) => s.id));
    const eligible = new Set([...selected].filter((id) => !membership.has(id)));
    const shelves = [
        ...(created &&
        !state.data?.shelves.content.some((s) => s.id === created.id)
            ? [created]
            : []),
        ...(state.data?.shelves.content ?? []),
    ];
    return (
        <>
            <ShelfPickerDialog
                title={book.title}
                choices={shelves.map((s) => ({
                    ...s,
                    containsBook: membership.has(s.id),
                }))}
                selected={eligible}
                loading={state.busy}
                busy={busy}
                error={error}
                loadError={
                    state.error ||
                    (!user ? 'Entre para organizar seus livros.' : undefined)
                }
                onSignIn={
                    !user
                        ? () =>
                              navigate('/login', {
                                  state: {
                                      from:
                                          location.pathname +
                                          location.search +
                                          location.hash,
                                  },
                              })
                        : undefined
                }
                onRetry={() => setRetry((v) => v + 1)}
                onClose={onClose}
                onCreate={() => setCreating(true)}
                onToggle={(id, checked) =>
                    setSelected((previous) => {
                        const next = new Set(previous);
                        if (checked) next.add(id);
                        else next.delete(id);
                        return next;
                    })
                }
                pagination={
                    state.data && (
                        <PaginationControls
                            page={page}
                            total={state.data.shelves.page.totalPages}
                            busy={busy || state.busy}
                            onChange={setPage}
                            label="Páginas de estantes"
                            className="shelf-picker-pagination"
                        />
                    )
                }
                onAdd={async () => {
                    if (
                        busy ||
                        !eligible.size ||
                        !user ||
                        state.busy ||
                        state.error
                    )
                        return;
                    setBusy(true);
                    setError('');
                    try {
                        await addBookToShelves(book.googleBooksId, [
                            ...eligible,
                        ]);
                        onAdded?.();
                        onClose();
                    } catch (e) {
                        setError(
                            getApiErrorMessage(
                                e,
                                'Não foi possível adicionar o livro às estantes.'
                            )
                        );
                        setRetry((v) => v + 1);
                    } finally {
                        setBusy(false);
                    }
                }}
            >
                {creating && (
                    <ShelfEditor
                        onClose={() => setCreating(false)}
                        onSaved={(s) => {
                            setCreated(s);
                            setSelected(
                                (previous) => new Set([...previous, s.id])
                            );
                            setCreating(false);
                            setPage(0);
                            setRetry((v) => v + 1);
                        }}
                    />
                )}
            </ShelfPickerDialog>
        </>
    );
}
