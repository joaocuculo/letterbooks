import { Dialog } from '@base-ui/react/dialog';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordInput from './PasswordInput';
import { removeToken } from '../utils/authStorage';
import { deleteAccount } from '../services/userService';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';
import '../styles/admin.css';

export default function AccountDeletion({
    userId,
    disabled,
}: {
    userId: number;
    disabled: boolean;
}) {
    const navigate = useNavigate();
    const trigger = useRef<HTMLButtonElement | null>(null);
    const [open, setOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    function close() {
        if (busy) return;
        setOpen(false);
        setPassword('');
        setError('');
    }

    return (
        <section className="profile-section profile-delete">
            <h2 className="profile-section-title">Excluir minha conta</h2>
            <p>
                A exclusão é definitiva. Suas avaliações, estantes e livros
                salvos serão removidos.
            </p>
            <button
                type="button"
                className="profile-delete-button"
                ref={trigger}
                disabled={disabled}
                onClick={() => setOpen(true)}
            >
                Excluir minha conta
            </button>
            {open && (
                <Dialog.Root
                    open
                    onOpenChange={(value) => {
                        if (!value) close();
                    }}
                >
                    <Dialog.Portal>
                        <Dialog.Backdrop className="admin-overlay" />
                        <Dialog.Popup
                            className="admin-dialog account-deletion-dialog"
                            finalFocus={trigger}
                            aria-busy={busy}
                        >
                            <Dialog.Title>Excluir minha conta</Dialog.Title>
                            <Dialog.Description>
                                Esta ação não pode ser desfeita. Seus dados
                                pessoais, avaliações, estantes, livros salvos e
                                tokens de recuperação serão excluídos. Os
                                livros, autores e categorias do catálogo
                                permanecem. Informe sua senha atual para
                                confirmar.
                            </Dialog.Description>
                            <form
                                noValidate
                                onSubmit={async (event) => {
                                    event.preventDefault();
                                    if (busy) return;
                                    if (!password.trim()) {
                                        setError('Informe sua senha atual.');
                                        return;
                                    }
                                    setBusy(true);
                                    setError('');
                                    try {
                                        await deleteAccount(userId, password);
                                        setPassword('');
                                        // Remove a credencial imediatamente; a Home encerra o contexto
                                        // após a navegação para evitar o redirecionamento da rota protegida.
                                        removeToken();
                                        navigate('/', {
                                            replace: true,
                                            state: { accountDeleted: true },
                                        });
                                    } catch (failure) {
                                        setError(
                                            getApiErrorMessage(
                                                failure,
                                                'Não foi possível excluir sua conta. Tente novamente.'
                                            )
                                        );
                                    } finally {
                                        setBusy(false);
                                    }
                                }}
                            >
                                <label htmlFor="delete-account-password">
                                    Senha atual
                                </label>
                                <PasswordInput
                                    id="delete-account-password"
                                    name="currentPassword"
                                    autoComplete="current-password"
                                    visibilityLabel="senha atual"
                                    value={password}
                                    disabled={busy}
                                    aria-invalid={!!error}
                                    aria-describedby={
                                        error
                                            ? 'delete-account-error'
                                            : undefined
                                    }
                                    onChange={(event) => {
                                        setPassword(event.target.value);
                                        setError('');
                                    }}
                                />
                                {error && (
                                    <p
                                        id="delete-account-error"
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
                                        onClick={close}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        className="admin-danger-button"
                                        disabled={busy}
                                    >
                                        {busy
                                            ? 'Excluindo...'
                                            : 'Excluir definitivamente'}
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
