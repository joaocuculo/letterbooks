import type { DiscoverSection } from '../types/discover';
import BookCard from './BookCard';

interface BookSectionProps {
    section: DiscoverSection;
}

function BookSection({ section }: BookSectionProps) {
    console.log('BookSection recebeu: ', section);

    function handleFavorite() {
        console.log('Usuário favoritou!');
    }

    return (
        <div className="flex flex-col my-4">
            <p>{section.title}</p>

            <div className="flex flex-row gap-4">
                {section.books.map((book) => (
                    <BookCard
                        key={book.id}
                        book={book}
                        onFavorite={handleFavorite}
                    />
                ))}
            </div>
        </div>
    );
}

export default BookSection;
