import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
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
    const [success, setSuccess] = useState('');
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
            {success && (
                <p className="admin-success" role="status">
                    {success}
                </p>
            )}
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
                                <button
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
                                        setSuccess('');
                                    }}
                                >
                                    Alterar papel e situação
                                </button>
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
                <Dialog.Root
                    open
                    onOpenChange={(open) => {
                        if (!open && !saving) setEditingUser(null);
                    }}
                >
                    <Dialog.Portal>
                        <Dialog.Backdrop className="admin-overlay" />
                        <Dialog.Popup
                            className="admin-dialog"
                            finalFocus={editButton}
                            aria-busy={saving}
                        >
                            <Dialog.Title>
                                Alterar papel e situação
                            </Dialog.Title>
                            <Dialog.Description>
                                Conta: {editingUser.name} ({editingUser.email}).
                                O papel Administrador permite acessar as áreas
                                administrativas. A situação Inativa impede novos
                                acessos à conta.
                            </Dialog.Description>
                            <form
                                onSubmit={async (event) => {
                                    event.preventDefault();
                                    if (
                                        saving ||
                                        editingUser.id ===
                                            authenticatedUser?.id ||
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
                                        setSuccess(
                                            `Conta de ${updated.name} atualizada: ${roleLabels[updated.role]}, ${statusLabels[updated.status]}.`
                                        );
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
                                <select
                                    id={roleId}
                                    value={role}
                                    disabled={saving}
                                    aria-describedby={
                                        saveError ? errorId : undefined
                                    }
                                    onChange={(event) =>
                                        setRole(event.target.value as UserRole)
                                    }
                                >
                                    <option value="USER">Usuário</option>
                                    <option value="ADMIN">Administrador</option>
                                </select>
                                <label htmlFor={statusId}>
                                    Situação da conta
                                </label>
                                <select
                                    id={statusId}
                                    value={status}
                                    disabled={saving}
                                    aria-describedby={
                                        saveError ? errorId : undefined
                                    }
                                    onChange={(event) =>
                                        setStatus(
                                            event.target.value as UserStatus
                                        )
                                    }
                                >
                                    <option value="ACTIVE">Ativa</option>
                                    <option value="INACTIVE">Inativa</option>
                                </select>
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
                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={() => setEditingUser(null)}
                                    >
                                        Cancelar
                                    </button>
                                    <button
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
                                    </button>
                                </div>
                            </form>
                        </Dialog.Popup>
                    </Dialog.Portal>
                </Dialog.Root>
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
