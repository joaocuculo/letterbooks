import { Check, Trash2, LibraryBig, BookMinus } from 'lucide-react';
import type { UserBookResponse, UserBookUpdate } from '../types/userBook';
import type { CardSelection } from './BookSelection';
import {
    userBookStatusLabels,
    userBookStatusOptions,
} from '../utils/userBookStatus';
import {
    BookCardFrame,
    BookFavoriteButton,
    BookOptionsMenu,
} from './BookCardFrame';
import {
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from './ui/dropdown-menu';

export default function LibraryBookCard({
    book,
    busy,
    onUpdate,
    onRemove,
    onAdd,
    onDetach,
    selection,
}: {
    book: UserBookResponse;
    busy: boolean;
    error?: string;
    onUpdate: (data: UserBookUpdate) => void;
    onRemove: () => void;
    onAdd?: () => void;
    onDetach?: () => void;
    selection?: CardSelection;
}) {
    return (
        <BookCardFrame
            selection={selection}
            title={book.book.title}
            googleBooksId={book.book.googleBooksId}
            thumbnailUrl={book.book.thumbnailUrl}
            busy={busy}
            actions={
                <>
                    <BookFavoriteButton
                        title={book.book.title}
                        favorite={book.isFavorite}
                        busy={busy}
                        onClick={() =>
                            onUpdate({ isFavorite: !book.isFavorite })
                        }
                    />
                    <BookOptionsMenu title={book.book.title} busy={busy}>
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>
                                Status de leitura
                            </DropdownMenuLabel>
                            {userBookStatusOptions.map((option) => (
                                <DropdownMenuItem
                                    key={option.value}
                                    onClick={() =>
                                        onUpdate({ status: option.value })
                                    }
                                    disabled={book.status === option.value}
                                >
                                    <span>{option.label}</span>
                                    {book.status === option.value && (
                                        <Check
                                            size={15}
                                            className="ml-auto"
                                            aria-hidden="true"
                                        />
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        {onAdd && (
                            <DropdownMenuItem onClick={onAdd}>
                                <LibraryBig aria-hidden="true" />
                                Adicionar a uma estante
                            </DropdownMenuItem>
                        )}
                        {onDetach && (
                            <DropdownMenuItem onClick={onDetach}>
                                <BookMinus aria-hidden="true" />
                                Retirar desta estante
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={onRemove}
                        >
                            <Trash2 size={15} aria-hidden="true" />
                            Remover da biblioteca
                        </DropdownMenuItem>
                    </BookOptionsMenu>
                </>
            }
        >
            <div className="book-item-reading">
                <p>{userBookStatusLabels[book.status]}</p>
                {book.currentPage !== null && (
                    <p>Página atual: {book.currentPage}</p>
                )}
            </div>
        </BookCardFrame>
    );
}
