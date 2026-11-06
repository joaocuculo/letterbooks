import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    TableState,
} from '../ui/table';
import { useToastMessage } from '../../hooks/useToastMessage';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useCallback, useEffect, useId, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '../ui/dialog';
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
    useToastMessage(success);
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
                <Button
                    variant="default"
                    type="button"
                    onClick={() => {
                        setName('');
                        setError('');
                        setOpen(true);
                    }}
                >
                    <Plus size={17} aria-hidden="true" />
                    {c.createLabel}
                </Button>
            </div>
            <div className="admin-list-heading">
                <h2>
                    {c.title}{' '}
                    {kind === 'authors' ? 'cadastrados' : 'cadastradas'}
                </h2>
                {result && <span>{result.page.totalElements} registros</span>}
            </div>
            <Table aria-label={c.title}>
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            {kind === 'authors' ? 'Autor' : 'Categoria'}
                        </TableHead>
                        <TableHead>Identificador</TableHead>
                        <TableHead className="table-actions">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {resource.busy ? (
                        <TableState columns={3} loading>
                            Carregando {c.plural}...
                        </TableState>
                    ) : resource.error ? (
                        <TableState columns={3}>
                            <AdminFailure
                                message={resource.error}
                                retry={() => setRevision((v) => v + 1)}
                            />
                        </TableState>
                    ) : result?.content.length === 0 ? (
                        <TableState columns={3}>
                            Nenhum registro cadastrado. Use “{c.createLabel}”
                            para começar.
                        </TableState>
                    ) : (
                        result?.content.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="table-identity">
                                    {item.name}
                                </TableCell>
                                <TableCell>{item.id}</TableCell>
                                <TableCell className="table-actions">
                                    <Link
                                        className="table-action-link"
                                        aria-label={'Gerenciar ' + item.name}
                                        to={c.base + '/' + item.id}
                                        state={{
                                            returnTo:
                                                location.pathname +
                                                location.search,
                                        }}
                                    >
                                        Gerenciar
                                        <ArrowRight
                                            size={14}
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
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
                <Dialog
                    open
                    onOpenChange={(value) => {
                        if (!value && !busy) setOpen(false);
                    }}
                >
                    <DialogContent
                        showCloseButton={false}
                        className="domain-dialog domain-admin-dialog"
                        aria-busy={busy}
                    >
                        <DialogTitle>{c.createLabel}</DialogTitle>
                        <DialogDescription>
                            {kind === 'authors'
                                ? 'Cadastre o nome principal do autor.'
                                : 'Use “/” para cadastrar categorias independentes em uma única operação.'}
                        </DialogDescription>
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
                                    const created = await c.create(normalized);
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
                            <Input
                                id={inputId}
                                value={name}
                                disabled={busy}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                aria-invalid={!!error}
                                aria-describedby={error ? errorId : undefined}
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
                                <Button
                                    variant="outline"
                                    type="button"
                                    disabled={busy}
                                    onClick={() => setOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    loading={busy}
                                    variant="default"
                                    type="submit"
                                    disabled={busy}
                                >
                                    {busy
                                        ? 'Criando...'
                                        : kind === 'authors'
                                          ? 'Criar autor'
                                          : 'Criar categorias'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </section>
    );
}
