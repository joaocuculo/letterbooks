import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import {
    useBeforeUnload,
    useBlocker,
    useLocation,
    useNavigate,
} from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from './ui/dialog';
import { toast } from './ui/toast-manager';
import BulkAddToShelfDialog from './BulkAddToShelfDialog';
import type { BulkShelfResult } from '../services/bookshelfService';
import '../styles/book-selection.css';

export interface CardSelection {
    checked: boolean;
    disabled: boolean;
    onChange: () => void;
}
type Session = {
    key: string;
    route: string;
    userId: number;
    available: string[];
    selected: Set<string>;
    onAdded: () => void;
};
interface SelectionContext {
    session: Session | null;
    busy: boolean;
    start: (key: string, ids: string[], onAdded: () => void) => void;
    toggle: (id: string) => void;
    toggleAll: () => void;
    cancel: () => void;
    openDialog: () => void;
    confirmChange: (action: () => void) => void;
    cardSelection: (key: string, id: string) => CardSelection | undefined;
}
const Context = createContext<SelectionContext | null>(null);
function routeKey(pathname: string, search: string) {
    const params = new URLSearchParams(search);
    params.delete('layout');
    params.sort();
    return pathname + '?' + params;
}

export function BookSelectionProvider({ children }: { children: ReactNode }) {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const route = routeKey(location.pathname, location.search);
    const [session, setSession] = useState<Session | null>(null);
    const [busy, setBusy] = useState(false);
    const [dialog, setDialog] = useState(false);
    const [pending, setPending] = useState<(() => void) | null>(null);
    if (session && (session.userId !== user?.id || session.route !== route)) {
        setSession(null);
        setDialog(false);
        setBusy(false);
        setPending(null);
    }
    const blocker = useBlocker(({ currentLocation, nextLocation }) =>
        Boolean(
            session &&
                session.userId === user?.id &&
                (busy || session.selected.size > 0) &&
                routeKey(currentLocation.pathname, currentLocation.search) !==
                    routeKey(nextLocation.pathname, nextLocation.search)
        )
    );
    useBeforeUnload((event) => {
        if (session && (session.selected.size > 0 || busy)) {
            event.preventDefault();
            event.returnValue = '';
        }
    });
    const selectedIds = useMemo(
        () => [...(session?.selected ?? [])],
        [session?.selected]
    );
    function cancel() {
        setSession(null);
        setDialog(false);
        setPending(null);
    }
    function start(key: string, ids: string[], onAdded: () => void) {
        if (!isAuthenticated || !user) {
            navigate('/login', {
                state: {
                    from: location.pathname + location.search + location.hash,
                },
            });
            return;
        }
        const activate = () => {
            setSession({
                key,
                route,
                userId: user.id,
                available: [...new Set(ids)].slice(0, 20),
                selected: new Set(),
                onAdded,
            });
            requestAnimationFrame(() =>
                document
                    .querySelector<HTMLElement>('.book-selection-checkbox')
                    ?.focus()
            );
        };
        confirmChange(activate);
    }
    function confirmChange(action: () => void) {
        if (busy) return;
        if (session?.selected.size) setPending(() => action);
        else action();
    }
    function toggle(id: string) {
        if (busy) return;
        setSession((previous) => {
            if (!previous || !previous.available.includes(id)) return previous;
            const selected = new Set(previous.selected);
            if (selected.has(id)) selected.delete(id);
            else if (selected.size < 20) selected.add(id);
            return { ...previous, selected };
        });
    }
    function toggleAll() {
        if (busy) return;
        setSession(
            (previous) =>
                previous && {
                    ...previous,
                    selected:
                        previous.selected.size === previous.available.length
                            ? new Set()
                            : new Set(previous.available),
                }
        );
    }
    function saved(result: BulkShelfResult) {
        const onAdded = session?.onAdded;
        const added = result.shelves.reduce(
            (sum, shelf) => sum + shelf.addedCount,
            0
        );
        const present = result.shelves.reduce(
            (sum, shelf) => sum + shelf.alreadyPresentCount,
            0
        );
        setBusy(false);
        cancel();
        if (blocker.state === 'blocked') blocker.reset();
        toast.add({
            title: `${added} ${added === 1 ? 'adição realizada' : 'adições realizadas'}; ${present} já estavam nas estantes.`,
            type: 'success',
        });
        onAdded?.();
    }
    const value: SelectionContext = {
        session,
        busy,
        start,
        toggle,
        toggleAll,
        cancel,
        openDialog: () => {
            if (session?.selected.size) setDialog(true);
        },
        confirmChange,
        cardSelection: (key, id) =>
            session?.key === key
                ? {
                      checked: session.selected.has(id),
                      disabled: busy,
                      onChange: () => toggle(id),
                  }
                : undefined,
    };
    const blocked = blocker.state === 'blocked';
    return (
        <Context value={value}>
            <div className={session ? 'book-selection-active' : undefined}>
                {children}
            </div>
            {dialog && session && (
                <BulkAddToShelfDialog
                    ids={selectedIds}
                    onClose={() => setDialog(false)}
                    onSaved={saved}
                    onBusyChange={setBusy}
                />
            )}
            <Dialog
                open={Boolean(pending || blocked)}
                onOpenChange={(open) => {
                    if (!open) {
                        setPending(null);
                        if (blocker.state === 'blocked') blocker.reset();
                    }
                }}
            >
                <DialogContent
                    className="domain-dialog"
                    showCloseButton={false}
                >
                    <DialogTitle>
                        {busy ? 'Operação em andamento' : 'Descartar seleção?'}
                    </DialogTitle>
                    <DialogDescription>
                        {busy
                            ? 'Aguarde o resultado da adição antes de sair desta página.'
                            : 'Os livros selecionados serão desmarcados. Nenhuma alteração será feita nas suas estantes.'}
                    </DialogDescription>
                    <div className="library-dialog-actions">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setPending(null);
                                if (blocker.state === 'blocked')
                                    blocker.reset();
                            }}
                        >
                            {busy ? 'Aguardar' : 'Continuar selecionando'}
                        </Button>
                        {!busy && (
                            <Button
                                onClick={() => {
                                    const action = pending;
                                    cancel();
                                    if (blocker.state === 'blocked')
                                        blocker.proceed();
                                    else action?.();
                                }}
                            >
                                Descartar e continuar
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </Context>
    );
}

// Shared by all book grids; a single provider owns the navigation blocker.
// eslint-disable-next-line react-refresh/only-export-components
export function useBookSelection() {
    const context = useContext(Context);
    if (!context) throw new Error('BookSelectionProvider is required.');
    return context;
}

export function BookSelectionControls({
    contextKey,
    ids,
    onAdded,
    disabled = false,
    section = false,
}: {
    contextKey: string;
    ids: string[];
    onAdded: () => void;
    disabled?: boolean;
    section?: boolean;
}) {
    const selection = useBookSelection();
    const entry = useRef<HTMLButtonElement>(null);
    const active = selection.session?.key === contextKey;
    const wasActive = useRef(false);
    const restoreFocus = useRef(false);
    useEffect(() => {
        if (wasActive.current && !active) restoreFocus.current = true;
        wasActive.current = active;
        if (!restoreFocus.current || active || disabled) return;
        const frame = requestAnimationFrame(() => {
            if (entry.current && !entry.current.disabled) {
                entry.current.focus({ preventScroll: true });
                restoreFocus.current = false;
            }
        });
        return () => cancelAnimationFrame(frame);
    }, [active, disabled]);
    if (!ids.length) return null;
    if (!active)
        return (
            <Button
                ref={entry}
                data-selection-entry
                variant="outline"
                size="sm"
                type="button"
                disabled={disabled || selection.busy}
                onClick={() => selection.start(contextKey, ids, onAdded)}
            >
                Selecionar livros
            </Button>
        );
    const session = selection.session!;
    return (
        <div
            className="book-selection-toolbar"
            role="group"
            aria-label="Seleção de livros"
        >
            <label className="book-selection-all">
                <Checkbox
                    checked={session.selected.size === session.available.length}
                    indeterminate={
                        session.selected.size > 0 &&
                        session.selected.size < session.available.length
                    }
                    disabled={selection.busy}
                    onCheckedChange={selection.toggleAll}
                />
                <span>
                    Selecionar todos desta {section ? 'seção' : 'página'}
                </span>
            </label>
            <div className="book-selection-actions">
                <span role="status">
                    {session.selected.size}{' '}
                    {session.selected.size === 1
                        ? 'selecionado'
                        : 'selecionados'}
                </span>
                <Button
                    variant="outline"
                    disabled={selection.busy}
                    onClick={selection.cancel}
                >
                    Cancelar
                </Button>
                <Button
                    disabled={!session.selected.size || selection.busy}
                    onClick={selection.openDialog}
                >
                    Adicionar às estantes
                </Button>
            </div>
        </div>
    );
}
