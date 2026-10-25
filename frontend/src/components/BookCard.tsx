import type { BookCardResponse } from '../types/book';
import ExploreBookCard from './ExploreBookCard';

interface BookCardProps {
    book: BookCardResponse;
    onFavorite: (book: BookCardResponse) => void;
    isLoading: boolean;
}

function BookCard({ book, onFavorite, isLoading }: BookCardProps) {
    return <div className="w-[200px] max-w-full"><ExploreBookCard book={book} onFavorite={onFavorite} busy={isLoading} /></div>;
}

export default BookCard;
