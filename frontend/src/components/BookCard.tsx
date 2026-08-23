import type { BookCardResponse } from '../types/book';

interface BookCardProps {
    book: BookCardResponse;
    onFavorite: (book: BookCardResponse) => void;
    isFavorite: boolean;
}

function BookCard({ book, onFavorite, isFavorite }: BookCardProps) {
    const authors = book.authors?.join(', ') ?? 'Autor não informado.';

    return (
        <div className="flex flex-col rounded-md shadow-md p-4 border border-purple-400 w-40">
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

            <button onClick={() => onFavorite(book)}>
                {isFavorite ? 'Desfavoritar' : 'Favoritar'}
            </button>
        </div>
    );
}

export default BookCard;
