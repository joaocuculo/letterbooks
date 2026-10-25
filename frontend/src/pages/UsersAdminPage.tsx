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
    const parsedPage = Number(params.get('page'));
    const page =
        Number.isSafeInteger(parsedPage) && parsedPage >= 0 ? parsedPage : 0;
    const [revision, setRevision] = useState(0);
    const [pagination, setPagination] = useState<PageMetadata | null>(null);
    const load = useCallback(
        async (signal: AbortSignal) => {
            const result = await findUsers(page, signal);
            if (!signal.aborted) setPagination(result.page);
            return result;
        },
        [page]
    );
    const resource = useLibraryResource(`users:${page}:${revision}`, load);
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
            {resource.busy ? (
                <p role="status">Carregando usuários...</p>
            ) : resource.error ? (
                <AdminFailure
                    message={resource.error}
                    retry={() => setRevision((value) => value + 1)}
                />
            ) : result?.content.length === 0 ? (
                <p className="admin-empty">Nenhum usuário cadastrado.</p>
            ) : (
                <ul className="admin-records admin-users">
                    {result?.content.map((user) => (
                        <li key={user.id}>
                            <div className="admin-user-identity">
                                <strong>{user.name}</strong>
                                <span>{user.email}</span>
                                <span>ID: {user.id}</span>
                            </div>
                            <dl className="admin-user-metadata">
                                <div>
                                    <dt>Papel</dt>
                                    <dd>{roleLabels[user.role]}</dd>
                                </div>
                                <div>
                                    <dt>Situação da conta</dt>
                                    <dd>{statusLabels[user.status]}</dd>
                                </div>
                                <div>
                                    <dt>Cadastro</dt>
                                    <dd>
                                        <time dateTime={user.createdAt}>
                                            {formatRegistrationDate(
                                                user.createdAt
                                            )}
                                        </time>
                                    </dd>
                                </div>
                            </dl>
                            <div className="admin-user-actions">
                                <Button
                                    variant="outline"
                                    type="button"
                                    disabled={user.id === authenticatedUser?.id}
                                    aria-describedby={
                                        user.id === authenticatedUser?.id
                                            ? `own-account-${user.id}`
                                            : undefined
                                    }
                                    aria-label={`Alterar papel e situação de ${user.name}`}
                                    onClick={(event) => {
                                        editButton.current =
                                            event.currentTarget;
                                        setEditingUser(user);
                                        setRole(user.role);
                                        setStatus(user.status);
                                        setSaveError('');
                                    }}
                                >
                                    Alterar papel e situação
                                </Button>
                                {user.id === authenticatedUser?.id && (
                                    <p id={`own-account-${user.id}`}>
                                        Você não pode alterar suas próprias
                                        permissões.
                                    </p>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
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
