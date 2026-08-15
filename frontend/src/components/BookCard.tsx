import type { BookCardResponse } from '../types/book';

interface BookCardProps {
    book: BookCardResponse;
}

function BookCard({ book }: BookCardProps) {
    const authors = book.authors?.join(', ') ?? 'Autor não informado.';

    return (
        <div className="flex flex-col rounded-md shadow-md p-4 border border-purple-400 w-fit">
            {book.thumbnailUrl && (
                <img
                    src={book.thumbnailUrl}
                    alt={`Capa do livro ${book.title}`}
                    className="max-w-36 "
                />
            )}
            <p>{book.title}</p>
            <p>{authors}</p>
            <p>{book.publisher}</p>
            <p>{book.publishedDate}</p>
        </div>
    );
}

export default BookCard;
