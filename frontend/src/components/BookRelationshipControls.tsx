import type {
    UserBookResponse,
    UserBookStatus,
} from '../types/userBook';
import { userBookStatusOptions } from '../utils/userBookStatus';

interface BookRelationshipControlsProps {
    userBook: UserBookResponse | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isSaving: boolean;
    errorMessage: string | null;
    onFavoriteToggle: () => void;
    onStatusChange: (status: UserBookStatus) => void;
}

function BookRelationshipControls({
    userBook,
    isAuthenticated,
    isLoading,
    isSaving,
    errorMessage,
    onFavoriteToggle,
    onStatusChange,
}: BookRelationshipControlsProps) {
    if (isAuthenticated && isLoading) {
        return (
            <section>
                <h2>Minha relação com o livro</h2>
                <p>Carregando seus dados...</p>
            </section>
        );
    }

    return (
        <section>
            <h2>Minha relação com o livro</h2>

            {errorMessage && <p role="alert">{errorMessage}</p>}

            <button
                type="button"
                onClick={onFavoriteToggle}
                disabled={isSaving}
            >
                {isSaving
                    ? 'Salvando...'
                    : userBook?.isFavorite
                      ? 'Desfavoritar'
                      : 'Favoritar'}
            </button>

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
        </section>
    );
}

export default BookRelationshipControls;
