import { Link } from 'react-router-dom';
import type { UserBookResponse } from '../types/userBook';
import { userBookStatusLabels } from '../utils/userBookStatus';

interface UserBookCardProps {
    userBook: UserBookResponse;
}

function UserBookCard({ userBook }: UserBookCardProps) {
    const { book } = userBook;

    return (
        <article>
            <Link to={`/books/${book.googleBooksId}`}>
                {book.thumbnailUrl ? (
                    <img
                        src={book.thumbnailUrl.replace(/^http:/, 'https:')}
                        alt={`Capa do livro ${book.title}`}
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <div>Sem capa disponível</div>
                )}

                <h3>{book.title}</h3>
            </Link>

            <p>Status: {userBookStatusLabels[userBook.status]}</p>
            {userBook.isFavorite && <p>Favorito</p>}
            {userBook.currentPage !== null && (
                <p>Página atual: {userBook.currentPage}</p>
            )}
        </article>
    );
}

export default UserBookCard;
