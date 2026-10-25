import { Feedback } from './ui/feedback';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectItem,
} from './ui/select';
import { Button } from './ui/button';
import { Heart, Trash2, LibraryBig } from 'lucide-react';
import type { UserBookResponse, UserBookStatus } from '../types/userBook';
import {
    isUserBookStatus,
    userBookStatusOptions,
} from '../utils/userBookStatus';

interface BookRelationshipControlsProps {
    userBook: UserBookResponse | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isSaving: boolean;
    errorMessage: string | null;
    onFavoriteToggle: () => void;
    onStatusChange: (status: UserBookStatus) => void;
    onRemove: () => void;
    onAddToShelf?: () => void;
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
    onAddToShelf,
}: BookRelationshipControlsProps) {
    if (isAuthenticated && isLoading)
        return <Feedback kind="loading" title="Carregando seus dados..." />;
    return (
        <section
            className="book-relationship"
            aria-label="Minha relação com o livro"
            aria-busy={isSaving}
        >
            {errorMessage && <Feedback kind="error" title={errorMessage} />}
            <div className="book-relationship-row">
                <Button
                    variant="outline"
                    type="button"
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
                </Button>
                <div className="book-status-field">
                    <label htmlFor="book-status">Status de leitura</label>
                    <Select
                        items={userBookStatusOptions}
                        value={userBook?.status ?? null}
                        onValueChange={(value) => {
                            if (isUserBookStatus(value)) onStatusChange(value);
                        }}
                        disabled={isSaving}
                    >
                        <SelectTrigger id="book-status">
                            <SelectValue placeholder="Selecione um status" />
                        </SelectTrigger>
                        <SelectContent
                            alignItemWithTrigger={false}
                            align="start"
                        >
                            <SelectGroup>
                                {userBookStatusOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                {onAddToShelf && (
                    <Button
                        variant="default"
                        className="book-add-to-shelf"
                        type="button"
                        disabled={isSaving}
                        onClick={onAddToShelf}
                    >
                        <LibraryBig size={17} aria-hidden="true" />
                        Adicionar a uma estante
                    </Button>
                )}
            </div>
            {userBook && (
                <Button
                    variant="ghost"
                    type="button"
                    onClick={onRemove}
                    disabled={isSaving}
                >
                    <Trash2 size={15} aria-hidden="true" />
                    Remover da biblioteca
                </Button>
            )}
        </section>
    );
}
