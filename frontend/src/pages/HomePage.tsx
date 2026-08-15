import { useEffect, useState } from 'react';
import type { DiscoverSection } from '../types/discover';
import { discover } from '../services/bookService';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';
import BookCard from '../components/BookCard';

function HomePage() {
    const [sections, setSections] = useState<DiscoverSection[] | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function loadSections() {
            try {
                setIsLoading(true);
                setErrorMessage(null);

                const result = await discover();

                setSections(result.sections);
            } catch (error) {
                setErrorMessage(
                    getApiErrorMessage(
                        error,
                        'Houve um erro ao carregar os livros.'
                    )
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadSections();
    }, []);

    if (isLoading) {
        return (
            <div>
                <p>Carregando página inicial...</p>
            </div>
        );
    }

    if (errorMessage != null) {
        return (
            <div>
                <p>{errorMessage}</p>
            </div>
        );
    }

    return (
        <div>
            <h1>Página Inicial</h1>

            {sections?.map((section) => (
                <div key={section.key} className="flez flex-col my-4">
                    <p>{section.title}</p>

                    <div className="flex flex-row gap-4">
                        {section.books.map((book) => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default HomePage;
