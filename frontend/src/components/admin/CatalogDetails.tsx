import { useCallback, useId, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useLibraryResource } from '../../hooks/useLibraryResource';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage.';
import { catalogConfig, type CatalogKind } from './catalogConfig';
import { AdminConfirm, AdminFailure, AdminPager } from './AdminControls';
import type { AuthorResponse, AuthorNameResponse } from '../../types/author';
export default function CatalogDetails({ kind }: { kind: CatalogKind }) {
    const c = catalogConfig[kind];
    const params = useParams();
    const id = Number(kind === 'authors' ? params.authorId : params.categoryId);
    const valid = Number.isSafeInteger(id) && id > 0;
    const location = useLocation();
    const navigate = useNavigate();
    const returnState = (location.state as { returnTo?: unknown } | null)
        ?.returnTo;
    const back =
        typeof returnState === 'string' &&
        (returnState === c.base || returnState.startsWith(c.base + '?'))
            ? returnState
            : c.base;
    const [revision, setRevision] = useState(0);
    const [name, setName] = useState('');
    const [busy, setBusy] = useState('');
    const lock = useRef(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [confirm, setConfirm] = useState<
        | { type: 'remove'; name: AuthorNameResponse }
        | { type: 'merge'; source: AuthorResponse }
        | null
    >(null);
    const [confirmError, setConfirmError] = useState('');
    const heading = useRef<HTMLHeadingElement>(null);
    const inputId = useId();
    const errorId = useId();
    const load = useCallback(
        async (signal: AbortSignal) => {
            if (!valid) return null;
            const [entity, names] = await Promise.all([
                c.get(id, signal),
                c.names(id, signal),
            ]);
            return { entity, names, revision };
        },
        [c, id, valid, revision]
    );
    const resource = useLibraryResource(`${kind}:${id}`, load);
    const data = resource.data;
    const operating = !!busy || resource.busy;
    async function mutate(
        action: string,
        run: () => Promise<unknown>,
        message: string
    ) {
        if (lock.current) return;
        lock.current = true;
        setBusy(action);
        setError('');
        setSuccess('');
        try {
            await run();
            setSuccess(message);
            setRevision((v) => v + 1);
        } catch (e) {
            setError(
                getApiErrorMessage(e, 'Não foi possível atualizar os nomes.')
            );
        } finally {
            lock.current = false;
            setBusy('');
        }
    }
    const backLink = (
        <Link className="admin-back" to={back}>
            <ArrowLeft size={16} aria-hidden="true" />
            Voltar para {c.plural}
        </Link>
    );
    if (!valid)
        return (
            <section>
                {backLink}
                <p className="admin-error" role="alert">
                    O identificador é inválido.
                </p>
            </section>
        );
    if (resource.busy && !data)
        return (
            <section>
                {backLink}
                <p role="status">Carregando {c.singular}...</p>
            </section>
        );
    if (!data)
        return (
            <section>
                {backLink}
                <AdminFailure
                    message={resource.error || 'Registro não encontrado.'}
                    retry={() => setRevision((v) => v + 1)}
                />
            </section>
        );
    return (
        <section className="admin-detail">
            {backLink}
            <div className="admin-detail-title">
                <h1 ref={heading} tabIndex={-1}>
                    {data.entity.name}
                </h1>
                <p>ID: {id}</p>
            </div>
            {resource.error && (
                <AdminFailure
                    message={resource.error}
                    retry={() => setRevision((v) => v + 1)}
                />
            )}
            {resource.busy && <p role="status">Atualizando nomes...</p>}
            <section
                className="admin-section"
                aria-labelledby="admin-names-title"
            >
                <h2 id="admin-names-title">Nomes cadastrados</h2>
                <ul className="admin-records">
                    {data.names.map((item) => (
                        <li key={item.id}>
                            <strong>{item.name}</strong>
                            {item.primary ? (
                                <span className="admin-badge">
                                    Nome principal
                                </span>
                            ) : (
                                <div className="admin-row-actions">
                                    <button
                                        disabled={operating}
                                        onClick={() =>
                                            void mutate(
                                                'primary',
                                                () => c.primary(id, item.id),
                                                'Nome principal alterado com sucesso.'
                                            )
                                        }
                                    >
                                        {busy === 'primary'
                                            ? 'Alterando...'
                                            : 'Tornar principal'}
                                    </button>
                                    <button
                                        className="admin-danger"
                                        disabled={operating}
                                        onClick={() => {
                                            setConfirmError('');
                                            setConfirm({
                                                type: 'remove',
                                                name: item,
                                            });
                                        }}
                                    >
                                        Remover
                                    </button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
                <form
                    className="admin-name-form"
                    aria-busy={operating}
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (operating) return;
                        if (!name.trim()) {
                            setError('Informe o nome alternativo.');
                            return;
                        }
                        void mutate(
                            'add',
                            async () => {
                                await c.add(id, name.trim());
                                setName('');
                            },
                            'Nome alternativo adicionado com sucesso.'
                        );
                    }}
                >
                    <label htmlFor={inputId}>Novo nome alternativo</label>
                    <div>
                        <input
                            id={inputId}
                            disabled={operating}
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            aria-invalid={!!error}
                            aria-describedby={error ? errorId : undefined}
                        />
                        <button className="admin-primary" disabled={operating}>
                            {busy === 'add'
                                ? 'Adicionando...'
                                : 'Adicionar nome'}
                        </button>
                    </div>
                </form>
                {error && (
                    <p id={errorId} className="admin-error" role="alert">
                        {error}
                    </p>
                )}
                {success && (
                    <p className="admin-success" role="status">
                        {success}
                    </p>
                )}
            </section>
            <MergeSection
                kind={kind}
                entity={data.entity}
                disabled={operating}
                onConfirm={(source) => {
                    setConfirmError('');
                    setConfirm({ type: 'merge', source });
                }}
            />
            {confirm && (
                <AdminConfirm
                    title={
                        confirm.type === 'remove'
                            ? 'Remover nome?'
                            : `Unir ${c.plural}?`
                    }
                    description={
                        confirm.type === 'remove'
                            ? `Remover o nome “${confirm.name.name}”?`
                            : `“${confirm.source.name}” (ID ${confirm.source.id}) será excluído. Seus nomes e livros serão transferidos para “${data.entity.name}” (ID ${id}).`
                    }
                    action={
                        confirm.type === 'remove'
                            ? 'Remover nome'
                            : `Unir ${c.plural}`
                    }
                    busy={!!busy}
                    error={confirmError}
                    finalFocus={heading}
                    onClose={() => {
                        if (!busy) setConfirm(null);
                    }}
                    onConfirm={() => {
                        if (lock.current) return;
                        lock.current = true;
                        setBusy('confirm');
                        setConfirmError('');
                        void (async () => {
                            try {
                                if (confirm.type === 'remove') {
                                    await c.remove(id, confirm.name.id);
                                    setConfirm(null);
                                    setSuccess('Nome removido com sucesso.');
                                    setRevision((v) => v + 1);
                                } else {
                                    await c.merge(id, confirm.source.id);
                                    navigate(back, {
                                        replace: true,
                                        state: {
                                            successMessage: `Registros unidos com sucesso.`,
                                        },
                                    });
                                }
                            } catch (e) {
                                setConfirmError(
                                    getApiErrorMessage(
                                        e,
                                        'Não foi possível concluir a operação.'
                                    )
                                );
                            } finally {
                                lock.current = false;
                                setBusy('');
                            }
                        })();
                    }}
                />
            )}
        </section>
    );
}
function MergeSection({
    kind,
    entity,
    disabled,
    onConfirm,
}: {
    kind: CatalogKind;
    entity: AuthorResponse;
    disabled: boolean;
    onConfirm: (source: AuthorResponse) => void;
}) {
    const c = catalogConfig[kind];
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [retry, setRetry] = useState(0);
    const [selected, setSelected] = useState<AuthorResponse | null>(null);
    const load = useCallback(
        (signal: AbortSignal) =>
            open ? c.find(page, signal) : Promise.resolve(null),
        [c, page, open]
    );
    const resource = useLibraryResource(
        `sources:${kind}:${entity.id}:${page}:${open}:${retry}`,
        load
    );
    const result = resource.data;
    const candidates = result?.content.filter((x) => x.id !== entity.id) || [];
    return (
        <section className="admin-section admin-merge">
            <button
                className="admin-disclosure"
                aria-expanded={open}
                aria-controls="admin-merge-content"
                disabled={disabled}
                onClick={() => setOpen((v) => !v)}
            >
                Unir {c.plural}
                <ChevronDown size={18} aria-hidden="true" />
            </button>
            {open && (
                <div id="admin-merge-content">
                    <p>
                        Este registro é o destino. Selecione a origem que será
                        absorvida e excluída.
                    </p>
                    <div className="admin-merge-summary">
                        <p>
                            <strong>Destino:</strong> {entity.name} · ID{' '}
                            {entity.id}
                        </p>
                        <p>
                            <strong>Origem:</strong>{' '}
                            {selected
                                ? `${selected.name} · ID ${selected.id}`
                                : 'Nenhuma selecionada'}
                        </p>
                    </div>
                    {resource.busy ? (
                        <p role="status">Carregando {c.plural}...</p>
                    ) : resource.error ? (
                        <AdminFailure
                            message={resource.error}
                            retry={() => setRetry((v) => v + 1)}
                        />
                    ) : candidates.length === 0 ? (
                        <p>Nenhuma origem disponível nesta página.</p>
                    ) : (
                        <fieldset className="admin-candidates">
                            <legend>
                                Selecione{' '}
                                {kind === 'authors' ? 'o autor' : 'a categoria'}{' '}
                                de origem
                            </legend>
                            {candidates.map((item) => (
                                <label key={item.id}>
                                    <input
                                        type="radio"
                                        name="merge-source"
                                        checked={selected?.id === item.id}
                                        disabled={disabled}
                                        onChange={() => setSelected(item)}
                                    />
                                    <span>
                                        {item.name}
                                        <small>ID: {item.id}</small>
                                    </span>
                                </label>
                            ))}
                        </fieldset>
                    )}
                    {result && (
                        <AdminPager
                            page={result.page.number}
                            total={result.page.totalPages}
                            busy={resource.busy || disabled}
                            onChange={setPage}
                            label={`Paginação das origens de ${c.plural}`}
                        />
                    )}
                    <button
                        className="admin-primary"
                        disabled={!selected || disabled || resource.busy}
                        onClick={() => {
                            if (selected) onConfirm(selected);
                        }}
                    >
                        Unir {c.plural}
                    </button>
                </div>
            )}
        </section>
    );
}
