import { Pencil } from 'lucide-react';
import { TableSortHead } from '../components/ui/table-sort-head';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    TableState,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { toast } from '../components/ui/toast-manager';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectItem,
} from '../components/ui/select';
import { Button } from '../components/ui/button';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '../components/ui/dialog';
import { useSearchParams } from 'react-router-dom';
import { AdminFailure, AdminPager } from '../components/admin/AdminControls';
import { useLibraryResource } from '../hooks/useLibraryResource';
import { findUsers, updateUserRoleAndStatus } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';
import type { UserResponse, UserRole, UserStatus } from '../types/user';
import type { PageMetadata } from '../types/page';
import {
    roleLabels,
    statusLabels,
    formatRegistrationDate,
} from '../utils/userPresentation';

export default function UsersAdminPage() {
    const { user: authenticatedUser } = useAuth();
    const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
    const [role, setRole] = useState<UserRole>('USER');
    const [status, setStatus] = useState<UserStatus>('ACTIVE');
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    const roleId = useId();
    const statusId = useId();
    const errorId = useId();
    const editButton = useRef<HTMLElement | null>(null);
    const titleRef = useRef<HTMLHeadingElement | null>(null);
    const [params, setParams] = useSearchParams();
    const requestedSort = params.get('sort') ?? 'createdAt,desc';
    const sort = /^(name|email|createdAt),(asc|desc)$/.test(requestedSort)
        ? requestedSort
        : 'createdAt,desc';
    const [sortField, sortDirection] = sort.split(',');
    const changeSort = (field: string) =>
        setParams((previous) => {
            const next = new URLSearchParams(previous);
            next.set(
                'sort',
                field +
                    ',' +
                    (sortField === field && sortDirection === 'asc'
                        ? 'desc'
                        : 'asc')
            );
            next.delete('page');
            return next;
        });
    const parsedPage = Number(params.get('page'));
    const page =
        Number.isSafeInteger(parsedPage) && parsedPage >= 0 ? parsedPage : 0;
    const [revision, setRevision] = useState(0);
    const [pagination, setPagination] = useState<PageMetadata | null>(null);
    const load = useCallback(
        async (signal: AbortSignal) => {
            const result = await findUsers(page, signal, sort);
            if (!signal.aborted) setPagination(result.page);
            return result;
        },
        [page, sort]
    );
    const resource = useLibraryResource(
        `users:${page}:${sort}:${revision}`,
        load
    );
    const result = resource.data;
    const changePage = useCallback(
        (nextPage: number) =>
            setParams((previous) => {
                const next = new URLSearchParams(previous);
                if (nextPage === 0) next.delete('page');
                else next.set('page', String(nextPage));
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
        <section className="admin-catalog" aria-labelledby="admin-users-title">
            <div className="admin-title-row">
                <div>
                    <h1 id="admin-users-title" ref={titleRef} tabIndex={-1}>
                        Usuários
                    </h1>
                    <p>Consulte as contas cadastradas.</p>
                </div>
            </div>

            <div className="admin-list-heading">
                <h2>Usuários cadastrados</h2>
                {result && <span>{result.page.totalElements} registros</span>}
            </div>
            <Table className="ui-table-users" aria-label="Usuários cadastrados">
                <TableHeader>
                    <TableRow>
                        {(
                            [
                                ['name', 'Usuário'],
                                ['email', 'E-mail'],
                            ] as const
                        ).map(([field, label]) => (
                            <TableSortHead
                                key={field}
                                direction={
                                    sortField === field
                                        ? (sortDirection as 'asc' | 'desc')
                                        : undefined
                                }
                                onSort={() => changeSort(field)}
                            >
                                {label}
                            </TableSortHead>
                        ))}
                        <TableHead>Papel</TableHead>
                        <TableHead>Situação</TableHead>
                        <TableSortHead
                            direction={
                                sortField === 'createdAt'
                                    ? (sortDirection as 'asc' | 'desc')
                                    : undefined
                            }
                            onSort={() => changeSort('createdAt')}
                        >
                            Cadastro
                        </TableSortHead>
                        <TableHead className="table-actions">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {resource.busy ? (
                        <TableState columns={6} loading>
                            Carregando usuários...
                        </TableState>
                    ) : resource.error ? (
                        <TableState columns={6}>
                            <AdminFailure
                                message={resource.error}
                                retry={() => setRevision((v) => v + 1)}
                            />
                        </TableState>
                    ) : result?.content.length === 0 ? (
                        <TableState columns={6}>
                            Nenhum usuário cadastrado.
                        </TableState>
                    ) : (
                        result?.content.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="table-identity">
                                    {user.name}
                                    <span className="table-secondary">
                                        ID: {user.id}
                                    </span>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell className="table-nowrap">
                                    {roleLabels[user.role]}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            user.status === 'ACTIVE'
                                                ? 'secondary'
                                                : 'outline'
                                        }
                                    >
                                        {statusLabels[user.status]}
                                    </Badge>
                                </TableCell>
                                <TableCell className="table-nowrap">
                                    <time dateTime={user.createdAt}>
                                        {formatRegistrationDate(user.createdAt)}
                                    </time>
                                </TableCell>
                                <TableCell className="table-actions">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        type="button"
                                        disabled={
                                            user.id === authenticatedUser?.id
                                        }
                                        aria-describedby={
                                            user.id === authenticatedUser?.id
                                                ? `own-account-${user.id}`
                                                : undefined
                                        }
                                        aria-label={`Editar papel e situação de ${user.name}`}
                                        onClick={(event) => {
                                            editButton.current =
                                                event.currentTarget;
                                            setEditingUser(user);
                                            setRole(user.role);
                                            setStatus(user.status);
                                            setSaveError('');
                                        }}
                                    >
                                        <Pencil aria-hidden="true" /> Editar
                                    </Button>
                                    {user.id === authenticatedUser?.id && (
                                        <span
                                            className="sr-only"
                                            id={'own-account-' + user.id}
                                        >
                                            Você não pode alterar suas próprias
                                            permissões.
                                        </span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            {editingUser && (
                <Dialog
                    open
                    onOpenChange={(open) => {
                        if (!open && !saving) setEditingUser(null);
                    }}
                >
                    <DialogContent
                        showCloseButton={false}
                        className="domain-dialog"
                        finalFocus={editButton}
                        aria-busy={saving}
                    >
                        <DialogTitle>Alterar papel e situação</DialogTitle>
                        <DialogDescription>
                            Conta: {editingUser.name} ({editingUser.email}). O
                            papel Administrador permite acessar as áreas
                            administrativas. A situação Inativa impede novos
                            acessos à conta.
                        </DialogDescription>
                        <form
                            onSubmit={async (event) => {
                                event.preventDefault();
                                if (
                                    saving ||
                                    editingUser.id === authenticatedUser?.id ||
                                    (role === editingUser.role &&
                                        status === editingUser.status)
                                )
                                    return;
                                setSaving(true);
                                setSaveError('');
                                try {
                                    const updated =
                                        await updateUserRoleAndStatus(
                                            editingUser.id,
                                            { role, status }
                                        );
                                    toast.add({
                                        title: `Conta de ${updated.name} atualizada: ${roleLabels[updated.role]}, ${statusLabels[updated.status]}.`,
                                        type: 'success',
                                    });
                                    editButton.current = titleRef.current;
                                    setEditingUser(null);
                                    setRevision((value) => value + 1);
                                } catch (error) {
                                    setSaveError(
                                        getApiErrorMessage(
                                            error,
                                            'Não foi possível atualizar a conta. Tente novamente.'
                                        )
                                    );
                                } finally {
                                    setSaving(false);
                                }
                            }}
                        >
                            <label htmlFor={roleId}>Papel</label>
                            <Select
                                items={[
                                    { value: 'USER', label: 'Usuário' },
                                    { value: 'ADMIN', label: 'Administrador' },
                                ]}
                                value={role}
                                disabled={saving}
                                onValueChange={(value) => {
                                    if (value !== null) setRole(value);
                                }}
                            >
                                <SelectTrigger
                                    id={roleId}
                                    aria-describedby={
                                        saveError ? errorId : undefined
                                    }
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent alignItemWithTrigger={false}>
                                    <SelectGroup>
                                        <SelectItem value="USER">
                                            Usuário
                                        </SelectItem>
                                        <SelectItem value="ADMIN">
                                            Administrador
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <label htmlFor={statusId}>Situação da conta</label>
                            <Select
                                items={[
                                    { value: 'ACTIVE', label: 'Ativa' },
                                    { value: 'INACTIVE', label: 'Inativa' },
                                ]}
                                value={status}
                                disabled={saving}
                                onValueChange={(value) => {
                                    if (value !== null) setStatus(value);
                                }}
                            >
                                <SelectTrigger
                                    id={statusId}
                                    aria-describedby={
                                        saveError ? errorId : undefined
                                    }
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent alignItemWithTrigger={false}>
                                    <SelectGroup>
                                        <SelectItem value="ACTIVE">
                                            Ativa
                                        </SelectItem>
                                        <SelectItem value="INACTIVE">
                                            Inativa
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {saveError && (
                                <p
                                    id={errorId}
                                    className="admin-error"
                                    role="alert"
                                >
                                    {saveError}
                                </p>
                            )}
                            <div className="admin-dialog-actions">
                                <Button
                                    variant="outline"
                                    type="button"
                                    disabled={saving}
                                    onClick={() => setEditingUser(null)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="default"
                                    type="submit"
                                    className="admin-primary"
                                    disabled={
                                        saving ||
                                        (role === editingUser.role &&
                                            status === editingUser.status)
                                    }
                                >
                                    {saving
                                        ? 'Salvando...'
                                        : 'Salvar alterações'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
            {pagination && !resource.error && (
                <AdminPager
                    page={page}
                    total={pagination.totalPages}
                    busy={resource.busy}
                    onChange={changePage}
                    label="Paginação de usuários"
                />
            )}
        </section>
    );
}
