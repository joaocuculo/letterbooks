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
        <section>
            <h2>{title}</h2>

            {books.length === 0 ? (
                <p>Nenhum livro nesta seção.</p>
            ) : (
                <div>
                    {books.map((userBook) => (
                        <UserBookCard
                            key={userBook.id}
                            userBook={userBook}
                        />
                    ))}
                </div>
            )}

            <Link to={viewMoreTo}>Ver mais</Link>
        </section>
    );
}

export default MyBooksSection;
