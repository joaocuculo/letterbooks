import type { UserBookResponse } from '../types/userBook';
import { userBookStatusLabels } from '../utils/userBookStatus';
import { BookCardFrame, BookOptionsMenu } from './BookCardFrame';
import { DropdownMenuItem } from './ui/dropdown-menu';
import { Trash2 } from 'lucide-react';

interface UserBookCardProps {
    userBook: UserBookResponse;
    isRemoving?: boolean;
    onRemove?: (userBook: UserBookResponse) => void;
}

function UserBookCard({
    userBook,
    isRemoving = false,
    onRemove,
}: UserBookCardProps) {
    const { book } = userBook;
    return (
        <div className="legacy-book-card">
            <BookCardFrame
                title={book.title}
                googleBooksId={book.googleBooksId}
                thumbnailUrl={book.thumbnailUrl}
                busy={isRemoving}
                actions={
                    onRemove && (
                        <BookOptionsMenu title={book.title} busy={isRemoving}>
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => onRemove(userBook)}
                            >
                                <Trash2 aria-hidden="true" />
                                Remover da biblioteca
                            </DropdownMenuItem>
                        </BookOptionsMenu>
                    )
                }
            >
                <div className="book-item-reading">
                    <p>Status: {userBookStatusLabels[userBook.status]}</p>
                    {userBook.isFavorite && <p>Favorito</p>}
                    {userBook.currentPage !== null && (
                        <p>Página atual: {userBook.currentPage}</p>
                    )}
                </div>
            </BookCardFrame>
        </div>
    );
}
export default UserBookCard;
