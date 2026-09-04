import { useEffect, useState } from 'react';
import { discover } from '../services/bookService';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';
import type { DiscoverSection } from '../types/discover';
import BookSection from '../components/BooksSection';
import type { BookCardResponse } from '../types/book';

function HomePage() {
    const [sections, setSections] = useState<DiscoverSection[] | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    function handleBookUpdated(updatedBook: BookCardResponse) {
        setSections((previous) => {
            if (!previous) {
                return previous;
            }

            return previous.map((section) => ({
                ...section,
                books: section.books.map((book) =>
                    book.id === updatedBook.id ? updatedBook : book
                ),
            }));
        });
    }

    useEffect(() => {
        console.log('useEffect da Home executou');
        async function loadSections() {
            try {
                setIsLoading(true);
                setErrorMessage(null);

                console.log('Iniciando carregamento da Home...');

                const result = await discover();

                console.log('Resposta do discover:', result);

                console.log('Seções recebidas:', result.sections);

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
            <div className="mx-auto max-w-7xl px-4 py-6">
                <p>Carregando página inicial...</p>
            </div>
        );
    }

    if (errorMessage != null) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-6">
                <p>{errorMessage}</p>
            </div>
        );
    }

    if (sections != null && sections.length === 0) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-6">
                <h1 className="mb-6">Página Inicial</h1>
                <p>Nenhum livro disponível no momento.</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-6">
            <h1 className="mb-6">Página Inicial</h1>

            {sections?.map((section) => (
                <BookSection
                    key={section.key}
                    section={section}
                    onBookUpdated={handleBookUpdated}
                />
            ))}
        </div>
    );
}

export default HomePage;
