import { useState } from 'react';
import { ArrowRight, BookOpen, RefreshCw } from 'lucide-react';
import type { BookSummary } from '../types/book';

function ShelfCover({ book }: { book: BookSummary }) {
    const [broken, setBroken] = useState(false);
    const source = book.thumbnailUrl?.replace(/^http:/, 'https:');
    return (
        <span className="library-shelf-cover">
            {source && !broken ? (
                <img
                    src={source}
                    alt=""
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={() => setBroken(true)}
                />
            ) : (
                <BookOpen size={24} aria-hidden="true" />
            )}
        </span>
    );
}

interface Props {
    label: string;
    books: BookSummary[];
    total?: number;
    busy: boolean;
    error?: string;
    onOpen: () => void;
    onRetry: () => void;
}

export default function LibraryShelfPreview({
    label,
    books,
    total,
    busy,
    error,
    onOpen,
    onRetry,
}: Props) {
    return (
        <section className="library-shelf">
            <button
                type="button"
                className="library-shelf-open"
                onClick={onOpen}
                aria-label={`Abrir estante ${label}${total === undefined ? '' : `, ${total} ${total === 1 ? 'livro' : 'livros'}`}`}
            >
                <span className="library-shelf-square" aria-hidden="true">
                    {Array.from({ length: 4 }, (_, index) =>
                        books[index] ? (
                            <ShelfCover
                                key={`${books[index].id}:${books[index].thumbnailUrl ?? ''}`}
                                book={books[index]}
                            />
                        ) : (
                            <span
                                className="library-shelf-slot"
                                key={`empty-${index}`}
                            />
                        )
                    )}
                    {!books.length && (
                        <span className="library-shelf-placeholder">
                            <BookOpen size={28} />
                            <span>
                                {busy
                                    ? 'Carregando...'
                                    : error
                                      ? 'Prévia indisponível'
                                      : 'Ainda sem livros'}
                            </span>
                        </span>
                    )}
                </span>
                <span className="library-shelf-caption">
                    <span className="library-shelf-name">{label}</span>
                    <ArrowRight size={16} aria-hidden="true" />
                </span>
                <span className="library-shelf-total">
                    {total === undefined
                        ? 'Ver estante'
                        : `${total} ${total === 1 ? 'livro' : 'livros'}`}
                </span>
            </button>
            {busy && (
                <p className="library-loading" role="status">
                    Carregando estante {label}...
                </p>
            )}
            {error && (
                <div className="library-error">
                    <p role="alert">{error}</p>
                    <button
                        type="button"
                        className="library-secondary"
                        onClick={onRetry}
                    >
                        <RefreshCw size={15} aria-hidden="true" /> Tentar
                        novamente
                    </button>
                </div>
            )}
        </section>
    );
}
