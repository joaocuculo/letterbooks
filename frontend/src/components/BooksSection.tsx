import { useState } from 'react';
import { createOrUpdate } from '../services/userBookService';
import type { BookCardResponse } from '../types/book';
import type { DiscoverSection } from '../types/discover';
import BookCard from './BookCard';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

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
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    async function handleFavoriteToggle(book: BookCardResponse) {
        if (!isAuthenticated) {
            navigate('/login', {
                state: {
                    from:
                        location.pathname +
                        location.search +
                        location.hash,
                },
            });
            return;
        }

        setLoadingBooks((previous) => ({
            ...previous,
            [book.id]: true,
        }));

        try {
            const result = await createOrUpdate(
                book.id,
                book.userBookId,
                { isFavorite: !book.isFavorite }
            );

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
        <section className="my-8 flex flex-col gap-3">
            <h2>{section.title}</h2>

            {errorMessage && <p>{errorMessage}</p>}

            <div className="flex flex-wrap gap-4">
                {section.books.map((book) => (
                    <BookCard
                        key={book.id}
                        book={book}
                        onFavorite={handleFavoriteToggle}
                        isLoading={loadingBooks[book.id] ?? false}
                    />
                ))}
            </div>
        </section>
    );
}

export default BookSection;
