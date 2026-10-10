import { Heart, Trash2 } from 'lucide-react';
import type { UserBookResponse, UserBookStatus } from '../types/userBook';
import { userBookStatusOptions } from '../utils/userBookStatus';

interface BookRelationshipControlsProps {
    userBook: UserBookResponse | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isSaving: boolean;
    errorMessage: string | null;
    onFavoriteToggle: () => void;
    onStatusChange: (status: UserBookStatus) => void;
    onRemove: () => void;
}

export default function BookRelationshipControls({
    userBook,
    isAuthenticated,
    isLoading,
    isSaving,
    errorMessage,
    onFavoriteToggle,
    onStatusChange,
    onRemove,
}: BookRelationshipControlsProps) {
    if (isAuthenticated && isLoading)
        return <p role="status">Carregando seus dados...</p>;
    return (
        <section
            className="book-relationship"
            aria-label="Minha relação com o livro"
            aria-busy={isSaving}
        >
            {errorMessage && (
                <p className="book-error" role="alert">
                    {errorMessage}
                </p>
            )}
            <div className="book-relationship-row">
                <button
                    type="button"
                    className="book-secondary"
                    aria-pressed={userBook?.isFavorite ?? false}
                    onClick={onFavoriteToggle}
                    disabled={isSaving}
                >
                    <Heart
                        size={17}
                        fill={userBook?.isFavorite ? 'currentColor' : 'none'}
                        aria-hidden="true"
                    />
                    {userBook?.isFavorite ? 'Favoritado' : 'Favoritar'}
                </button>
                <div className="book-status-field">
                    <label htmlFor="book-status">Status de leitura</label>
                    <select
                        id="book-status"
                        value={userBook?.status ?? ''}
                        onChange={(event) =>
                            onStatusChange(event.target.value as UserBookStatus)
                        }
                        disabled={isSaving}
                    >
                        <option value="" disabled>
                            Selecione um status
                        </option>
                        {userBookStatusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            {userBook && (
                <button
                    type="button"
                    className="book-text-button"
                    onClick={onRemove}
                    disabled={isSaving}
                >
                    <Trash2 size={15} aria-hidden="true" />
                    Remover da biblioteca
                </button>
            )}
            {isSaving && (
                <p role="status" className="book-muted">
                    Salvando...
                </p>
            )}
        </section>
    );
}
