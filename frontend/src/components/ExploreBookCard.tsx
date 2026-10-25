import { toast } from './ui/toast-manager';
import AddToShelfDialog from './AddToShelfDialog';
import { LibraryBig } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { BookCardResponse } from '../types/book';
import {
    BookCardFrame,
    BookFavoriteButton,
    BookOptionsMenu,
    BookRating,
} from './BookCardFrame';
import { DropdownMenuItem } from './ui/dropdown-menu';

interface Props {
    book: BookCardResponse;
    detailed?: boolean;
    busy: boolean;
    onFavorite: (book: BookCardResponse) => void;
}

export default function ExploreBookCard({
    book,
    detailed = false,
    busy,
    onFavorite,
}: Props) {
    const [adding, setAdding] = useState(false);
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    function openShelfPicker() {
        if (!isAuthenticated)
            navigate('/login', {
                state: {
                    from: location.pathname + location.search + location.hash,
                },
            });
        else setAdding(true);
    }
    return (
        <>
            <BookCardFrame
                title={book.title}
                googleBooksId={book.id}
                thumbnailUrl={book.thumbnailUrl}
                detailed={detailed}
                busy={busy}
                actions={
                    <>
                        <BookFavoriteButton
                            title={book.title}
                            favorite={book.isFavorite}
                            busy={busy}
                            onClick={() => onFavorite(book)}
                        />
                        <BookOptionsMenu title={book.title} busy={busy}>
                            <DropdownMenuItem onClick={openShelfPicker}>
                                <LibraryBig aria-hidden="true" />
                                Adicionar a uma estante
                            </DropdownMenuItem>
                        </BookOptionsMenu>
                    </>
                }
            >
                <p className="book-item-authors">
                    {book.authors?.filter(Boolean).join(', ') ||
                        'Autor não informado.'}
                </p>
                <BookRating averageRating={book.averageRating ?? null} />
                {detailed && (
                    <dl className="book-item-metadata">
                        <div>
                            <dt>Editora</dt>
                            <dd>{book.publisher || 'Não informada.'}</dd>
                        </div>
                        <div>
                            <dt>Publicação</dt>
                            <dd>
                                {book.publishedDate || 'Data não informada.'}
                            </dd>
                        </div>
                    </dl>
                )}
            </BookCardFrame>
            {adding && (
                <AddToShelfDialog
                    book={{ googleBooksId: book.id, title: book.title }}
                    onClose={() => setAdding(false)}
                    onAdded={() =>
                        toast.add({
                            title: 'Livro adicionado às estantes selecionadas.',
                            type: 'success',
                        })
                    }
                />
            )}
        </>
    );
}
