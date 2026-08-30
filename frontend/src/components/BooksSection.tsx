import { useState } from 'react';
import { create, update } from '../services/userBookService';
import type { BookCardResponse } from '../types/book';
import type { DiscoverSection } from '../types/discover';
import type { UserBookResponse } from '../types/userBook';
import BookCard from './BookCard';

interface BookSectionProps {
    section: DiscoverSection;
}

function BookSection({ section }: BookSectionProps) {
    const [favoriteBooks, setFavoriteBooks] = useState<
        Record<string, UserBookResponse>
    >({});

    async function handleFavoriteToggle(book: BookCardResponse) {
        if (book.userBookId) {
            update(book.userBookId, { isFavorite: !book.isFavorite });
        } else {
            create({ googleBooksId: book.id, isFavorite: true });
        }
    }

    return (
        <div className="flex flex-col my-4">
            <p>{section.title}</p>

            <div className="flex flex-row gap-4">
                {section.books.map((book) => (
                    <BookCard
                        key={book.id}
                        book={book}
                        onFavorite={handleFavoriteToggle}
                        isFavorite={favoriteBooks[book.id]?.isFavorite ?? false}
                    />
                ))}
            </div>
        </div>
    );
}

export default BookSection;
