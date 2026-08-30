import { useState } from 'react';
import { create, update } from '../services/userBookService';
import type { BookCardResponse } from '../types/book';
import type { DiscoverSection } from '../types/discover';
import type { UserBookRequest, UserBookUpdate } from '../types/userBook';
import BookCard from './BookCard';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utils/authStorage';

interface BookSectionProps {
    section: DiscoverSection;
    onBookUpdated: (book: BookCardResponse) => void;
}

function BookSection({ section, onBookUpdated }: BookSectionProps) {
    console.log('BookSection renderizou:', section.key);
    const [loadingBooks, setLoadingBooks] = useState<Record<string, boolean>>(
        {}
    );
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const navigate = useNavigate();

    async function handleFavoriteToggle(book: BookCardResponse) {
        const token = getToken();

        if (!token) {
            navigate('/login');
            return;
        }

        setLoadingBooks((previous) => ({
            ...previous,
            [book.id]: true,
        }));

        try {
            if (book.userBookId) {
                const data: UserBookUpdate = { isFavorite: !book.isFavorite };

                const result = await update(book.userBookId, data);

                onBookUpdated({
                    ...book,
                    isFavorite: result.isFavorite,
                    userBookId: result.id,
                });

                return;
            }

            const data: UserBookRequest = {
                googleBooksId: book.id,
                isFavorite: true,
            };

            const result = await create(data);

            onBookUpdated({
                ...book,
                isFavorite: result.isFavorite,
                userBookId: result.id,
            });
        } catch (error) {
            setErrorMessage(
                getApiErrorMessage(
                    error,
                    'Não foi possível atualizar o favorito.'
                )
            );
        } finally {
            setLoadingBooks((previous) => ({
                ...previous,
                [book.id]: false,
            }));
        }
    }

    return (
        <div className="flex flex-col my-4">
            <p>{section.title}</p>

            {errorMessage && <p>{errorMessage}</p>}

            <div className="flex flex-row gap-4">
                {section.books.map((book) => (
                    <BookCard
                        key={book.id}
                        book={book}
                        onFavorite={handleFavoriteToggle}
                        isLoading={loadingBooks[book.id] ?? false}
                    />
                ))}
            </div>
        </div>
    );
}

export default BookSection;
