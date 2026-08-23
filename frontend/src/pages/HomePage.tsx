import { useEffect, useState } from 'react';
import { discover } from '../services/bookService';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';
import type { DiscoverSection } from '../types/discover';
import BookSection from '../components/BooksSection';

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
                <BookSection key={section.key} section={section} />
            ))}
        </div>
    );
}

export default HomePage;
