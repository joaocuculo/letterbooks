import { Link } from 'react-router-dom';
import type { UserBookResponse } from '../types/userBook';
import UserBookCard from './UserBookCard';

interface MyBooksSectionProps {
    title: string;
    books: UserBookResponse[];
    viewMoreTo: string;
}

function MyBooksSection({ title, books, viewMoreTo }: MyBooksSectionProps) {
    return (
        <section className="mb-10">
            <h2 className="mb-3">{title}</h2>

            {books.length === 0 ? (
                <p>Nenhum livro nesta seção.</p>
            ) : (
                <div className="flex flex-wrap gap-6">
                    {books.map((userBook) => (
                        <UserBookCard
                            key={userBook.id}
                            userBook={userBook}
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
