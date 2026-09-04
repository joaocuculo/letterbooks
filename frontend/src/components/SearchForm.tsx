import { useState, type SubmitEvent } from 'react';
import type { BookSearchFilters } from '../types/bookSearch';

interface SearchFormProps {
    initialFilters: BookSearchFilters;
    onSearch: (filters: BookSearchFilters) => void;
}

function SearchForm({ initialFilters, onSearch }: SearchFormProps) {
    const [freeText, setFreeText] = useState(initialFilters.freeText ?? '');
    const [title, setTitle] = useState(initialFilters.title ?? '');
    const [author, setAuthor] = useState(initialFilters.author ?? '');
    const [publisher, setPublisher] = useState(
        initialFilters.publisher ?? ''
    );
    const [subject, setSubject] = useState(initialFilters.subject ?? '');
    const [isbn, setIsbn] = useState(initialFilters.isbn ?? '');
    const [validationMessage, setValidationMessage] = useState<string | null>(
        null
    );

    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const filters: BookSearchFilters = {
            freeText: freeText.trim(),
            title: title.trim(),
            author: author.trim(),
            publisher: publisher.trim(),
            subject: subject.trim(),
            isbn: isbn.trim(),
        };

        const hasValue = Object.values(filters).some(Boolean);

        if (!hasValue) {
            setValidationMessage('Informe ao menos um termo para pesquisar.');
            return;
        }

        setValidationMessage(null);
        onSearch(filters);
    }

    return (
        <form
            className="flex max-w-3xl flex-col gap-4"
            onSubmit={handleSubmit}
            noValidate
        >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end">
                <div className="flex flex-1 flex-col gap-1">
                    <label htmlFor="search-free-text">
                        Pesquisar livros
                    </label>
                    <input
                        id="search-free-text"
                        name="freeText"
                        type="search"
                        value={freeText}
                        onChange={(event) => {
                            setFreeText(event.target.value);
                            setValidationMessage(null);
                        }}
                        placeholder="Título, autor ou assunto"
                    />
                </div>

                <button type="submit">Pesquisar</button>
            </div>

            <details>
                <summary className="cursor-pointer">Pesquisa avançada</summary>

                <div className="mt-3 flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="search-title">Título</label>
                        <input
                            id="search-title"
                            name="title"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="search-author">Autor</label>
                        <input
                            id="search-author"
                            name="author"
                            value={author}
                            onChange={(event) => setAuthor(event.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="search-publisher">Editora</label>
                        <input
                            id="search-publisher"
                            name="publisher"
                            value={publisher}
                            onChange={(event) =>
                                setPublisher(event.target.value)
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="search-subject">Assunto</label>
                        <input
                            id="search-subject"
                            name="subject"
                            value={subject}
                            onChange={(event) => setSubject(event.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="search-isbn">ISBN</label>
                        <input
                            id="search-isbn"
                            name="isbn"
                            value={isbn}
                            onChange={(event) => setIsbn(event.target.value)}
                        />
                    </div>
                </div>
            </details>

            {validationMessage && <p role="alert">{validationMessage}</p>}
        </form>
    );
}

export default SearchForm;
