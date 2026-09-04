import { Link } from 'react-router-dom';
import type { BookCardResponse } from '../types/book';

interface BookCardProps {
    book: BookCardResponse;
    onFavorite: (book: BookCardResponse) => void;
    isLoading: boolean;
}

function BookCard({ book, onFavorite, isLoading }: BookCardProps) {
    const authors = book.authors?.join(', ') ?? 'Autor não informado.';

    return (
        <article className="flex w-44 flex-col gap-2 rounded-md border border-purple-400 p-4 shadow-md">
            <Link className="flex flex-col gap-2" to={`/books/${book.id}`}>
                {book.thumbnailUrl && (
                    <img
                        src={book.thumbnailUrl}
                        alt={`Capa do livro ${book.title}`}
                        className="h-48 w-full object-contain"
                    />
                )}
                <p>{book.title}</p>
                <p>{authors}</p>
                <p>{book.publisher}</p>
                <p>{book.publishedDate}</p>
            </Link>

            <button onClick={() => onFavorite(book)} disabled={isLoading}>
                {isLoading
                    ? 'Salvando...'
                    : book.isFavorite
                      ? 'Desfavoritar'
                      : 'Favoritar'}
            </button>
        </article>
    );
}

export default BookCard;
