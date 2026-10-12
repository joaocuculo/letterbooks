import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Ellipsis } from 'lucide-react';
import { Menu } from '@base-ui/react/menu';
import type { BookSummary } from '../types/book';

export default function LibraryBareBookCard({
    book,
    onAdd,
    onDetach,
}: {
    book: BookSummary;
    onAdd: () => void;
    onDetach: () => void;
}) {
    const [broken, setBroken] = useState(false);
    return (
        <article className="library-book">
            <Link
                className="library-cover"
                to={`/books/${encodeURIComponent(book.googleBooksId)}`}
                aria-label={`Ver detalhes de ${book.title}`}
            >
                {book.thumbnailUrl && !broken ? (
                    <img
                        src={book.thumbnailUrl.replace(/^http:/, 'https:')}
                        alt={`Capa de ${book.title}`}
                        loading="lazy"
                        onError={() => setBroken(true)}
                    />
                ) : (
                    <BookOpen aria-hidden="true" />
                )}
            </Link>
            <div className="library-book-info">
                <h3>
                    <Link
                        to={`/books/${encodeURIComponent(book.googleBooksId)}`}
                    >
                        {book.title}
                    </Link>
                </h3>
                <p>Sem status de leitura</p>
            </div>
            <div className="library-book-actions">
                <Menu.Root>
                    <Menu.Trigger
                        className="library-secondary"
                        aria-label={`Opções de ${book.title}`}
                    >
                        <Ellipsis size={18} />
                    </Menu.Trigger>
                    <Menu.Portal>
                        <Menu.Positioner>
                            <Menu.Popup className="landing library-menu">
                                <Menu.Item onClick={onAdd}>
                                    Adicionar a uma estante
                                </Menu.Item>
                                <Menu.Item onClick={onDetach}>
                                    Retirar desta estante
                                </Menu.Item>
                            </Menu.Popup>
                        </Menu.Positioner>
                    </Menu.Portal>
                </Menu.Root>
            </div>
        </article>
    );
}
