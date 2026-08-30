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
        <div className="flex flex-col rounded-md shadow-md p-4 border border-purple-400 w-40">
            <Link to={`/book/${book.id}`}>
                {book.thumbnailUrl && (
                    <img
                        src={book.thumbnailUrl}
                        alt={`Capa do livro ${book.title}`}
                        className="w-36 "
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
        </div>
    );
}

export default BookCard;
