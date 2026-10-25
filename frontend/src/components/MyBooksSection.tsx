import { Link } from 'react-router-dom';
import type { UserBookResponse } from '../types/userBook';
import UserBookCard from './UserBookCard';
import { Feedback } from './ui/feedback';

interface MyBooksSectionProps {
    title: string;
    books: UserBookResponse[];
    viewMoreTo: string;
    removingUserBookId: number | null;
    onRemove: (userBook: UserBookResponse) => void;
}

function MyBooksSection({
    title,
    books,
    viewMoreTo,
    removingUserBookId,
    onRemove,
}: MyBooksSectionProps) {
    return (
        <section className="mb-10">
            <h2 className="mb-3">{title}</h2>

            {books.length === 0 ? (
                <Feedback kind="empty" title="Nenhum livro nesta seção." />
            ) : (
                <div className="flex flex-wrap gap-6">
                    {books.map((userBook) => (
                        <UserBookCard
                            key={userBook.id}
                            userBook={userBook}
                            isRemoving={removingUserBookId === userBook.id}
                            onRemove={onRemove}
                        />
                    ))}
                </div>
            )}

            <Link className="mt-3 inline-block" to={viewMoreTo}>
                Ver mais
            </Link>
        </section>
    );
}

export default MyBooksSection;
