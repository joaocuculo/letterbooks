import { useCallback, useEffect, useId, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Dialog } from '@base-ui/react/dialog';
import { ArrowRight, Plus } from 'lucide-react';
import { useLibraryResource } from '../../hooks/useLibraryResource';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage.';
import { catalogConfig, type CatalogKind } from './catalogConfig';
import { AdminFailure, AdminPager } from './AdminControls';
export default function CatalogList({ kind }: { kind: CatalogKind }) {
    const c = catalogConfig[kind];
    const [params, setParams] = useSearchParams();
    const location = useLocation();
    const parsed = Number(params.get('page'));
    const page = Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : 0;
    const [revision, setRevision] = useState(0);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const stateMessage = (location.state as { successMessage?: unknown } | null)
        ?.successMessage;
    const [success, setSuccess] = useState(
        typeof stateMessage === 'string' ? stateMessage : ''
    );
    const inputId = useId();
    const errorId = useId();
    const load = useCallback(
        (signal: AbortSignal) => c.find(page, signal),
        [c, page]
    );
    const resource = useLibraryResource(`${kind}:${page}:${revision}`, load);
    const result = resource.data;
    const changePage = useCallback(
        (p: number) =>
            setParams((old) => {
                const next = new URLSearchParams(old);
                if (p === 0) next.delete('page');
                else next.set('page', String(p));
                return next;
            }),
        [setParams]
    );
    useEffect(() => {
        if (
            result &&
            !resource.busy &&
            page > 0 &&
            page >= result.page.totalPages
        )
            changePage(Math.max(0, result.page.totalPages - 1));
    }, [result, resource.busy, page, changePage]);
    return (
        <section className="admin-catalog">
            <div className="admin-title-row">
                <div>
                    <h1>{c.title}</h1>
                    <p>{c.description}</p>
                </div>
                <button
                    className="admin-primary"
                    onClick={() => {
                        setName('');
                        setError('');
                        setOpen(true);
                    }}
                >
                    <Plus size={17} aria-hidden="true" />
                    {c.createLabel}
                </button>
            </div>
            {success && (
                <p className="admin-success" role="status">
                    {success}
                </p>
            )}
            <div className="admin-list-heading">
                <h2>
                    {c.title}{' '}
                    {kind === 'authors' ? 'cadastrados' : 'cadastradas'}
                </h2>
                {result && <span>{result.page.totalElements} registros</span>}
            </div>
            {resource.busy ? (
                <p role="status">Carregando {c.plural}...</p>
            ) : resource.error ? (
                <AdminFailure
                    message={resource.error}
                    retry={() => setRevision((v) => v + 1)}
                />
            ) : result?.content.length === 0 ? (
                <p className="admin-empty">
                    Nenhum registro cadastrado. Use “{c.createLabel}” para
                    começar.
                </p>
            ) : (
                <ul className="admin-records">
                    {result?.content.map((item) => (
                        <li key={item.id}>
                            <div>
                                <strong>{item.name}</strong>
                                <span>ID: {item.id}</span>
                            </div>
                            <Link
                                to={`${c.base}/${item.id}`}
                                state={{
                                    returnTo:
                                        location.pathname + location.search,
                                }}
                            >
                                Gerenciar
                                <ArrowRight size={16} aria-hidden="true" />
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
            {result && (
                <AdminPager
                    page={result.page.number}
                    total={result.page.totalPages}
                    busy={resource.busy}
                    onChange={changePage}
                    label={`Paginação de ${c.plural}`}
                />
            )}
            {open && (
                <Dialog.Root
                    open
                    onOpenChange={(value) => {
                        if (!value && !busy) setOpen(false);
                    }}
                >
                    <Dialog.Portal>
                        <Dialog.Backdrop className="admin-overlay" />
                        <Dialog.Popup className="admin-dialog" aria-busy={busy}>
                            <Dialog.Title>{c.createLabel}</Dialog.Title>
                            <Dialog.Description>
                                {kind === 'authors'
                                    ? 'Cadastre o nome principal do autor.'
                                    : 'Use “/” para cadastrar categorias independentes em uma única operação.'}
                            </Dialog.Description>
                            <form
                                onSubmit={async (event) => {
                                    event.preventDefault();
                                    if (busy) return;
                                    const normalized = name.trim();
                                    if (!normalized) {
                                        setError(
                                            kind === 'authors'
                                                ? 'Informe o nome do autor.'
                                                : 'Informe ao menos uma categoria.'
                                        );
                                        return;
                                    }
                                    setBusy(true);
                                    setError('');
                                    try {
                                        const created =
                                            await c.create(normalized);
                                        setSuccess(
                                            `Cadastro concluído: ${created.map((x) => x.name).join(', ')}.`
                                        );
                                        setOpen(false);
                                        setRevision((v) => v + 1);
                                    } catch (e) {
                                        setError(
                                            getApiErrorMessage(
                                                e,
                                                'Não foi possível criar. Tente novamente.'
                                            )
                                        );
                                    } finally {
                                        setBusy(false);
                                    }
                                }}
                            >
                                <label htmlFor={inputId}>{c.nameLabel}</label>
                                <input
                                    id={inputId}
                                    value={name}
                                    disabled={busy}
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                    aria-invalid={!!error}
                                    aria-describedby={
                                        error ? errorId : undefined
                                    }
                                    placeholder={
                                        kind === 'categories'
                                            ? 'Ex.: Fantasia / Aventura'
                                            : undefined
                                    }
                                />
                                {error && (
                                    <p
                                        id={errorId}
                                        className="admin-error"
                                        role="alert"
                                    >
                                        {error}
                                    </p>
                                )}
                                <div className="admin-dialog-actions">
                                    <button
                                        type="button"
                                        disabled={busy}
                                        onClick={() => setOpen(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        className="admin-primary"
                                        disabled={busy}
                                    >
                                        {busy
                                            ? 'Criando...'
                                            : kind === 'authors'
                                              ? 'Criar autor'
                                              : 'Criar categorias'}
                                    </button>
                                </div>
                            </form>
                        </Dialog.Popup>
                    </Dialog.Portal>
                </Dialog.Root>
            )}
        </section>
    );
}
