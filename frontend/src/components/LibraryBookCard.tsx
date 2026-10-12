import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from '@base-ui/react/menu';
import { BookOpen, Heart, Ellipsis, Check, Trash2 } from 'lucide-react';
import type { UserBookResponse, UserBookUpdate } from '../types/userBook';
import {
    userBookStatusLabels,
    userBookStatusOptions,
} from '../utils/userBookStatus';
export default function LibraryBookCard({
    book,
    busy,
    error,
    onUpdate,
    onRemove,
    onAdd,
    onDetach,
}: {
    book: UserBookResponse;
    busy: boolean;
    error?: string;
    onUpdate: (data: UserBookUpdate) => void;
    onRemove: () => void;
    onAdd?: () => void;
    onDetach?: () => void;
}) {
    const [broken, setBroken] = useState(false);
    return (
        <article className="library-book" aria-busy={busy}>
            <Link
                className="library-cover"
                to={`/books/${encodeURIComponent(book.book.googleBooksId)}`}
                aria-label={`Ver detalhes de ${book.book.title}`}
            >
                {book.book.thumbnailUrl && !broken ? (
                    <img
                        src={book.book.thumbnailUrl.replace(/^http:/, 'https:')}
                        alt={`Capa de ${book.book.title}`}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={() => setBroken(true)}
                    />
                ) : (
                    <span className="library-cover-missing">
                        <BookOpen size={24} aria-hidden="true" />
                        <span>Sem capa</span>
                    </span>
                )}
            </Link>
            <div className="library-book-info">
                <h3>
                    <Link
                        to={`/books/${encodeURIComponent(book.book.googleBooksId)}`}
                    >
                        {book.book.title}
                    </Link>
                </h3>
                <p className="library-book-status">
                    {userBookStatusLabels[book.status]}
                </p>
                {book.currentPage !== null && (
                    <p className="library-current-page">
                        Página atual: {book.currentPage}
                    </p>
                )}
            </div>
            <div className="library-book-actions">
                <button
                    type="button"
                    className="library-icon"
                    aria-label={`Favoritar ${book.book.title}`}
                    aria-pressed={book.isFavorite}
                    disabled={busy}
                    onClick={() => onUpdate({ isFavorite: !book.isFavorite })}
                >
                    <Heart
                        size={18}
                        fill={book.isFavorite ? 'currentColor' : 'none'}
                        aria-hidden="true"
                    />
                </button>
                <Menu.Root>
                    <Menu.Trigger
                        className="library-icon"
                        aria-label={`Opções de ${book.book.title}`}
                        disabled={busy}
                    >
                        <Ellipsis size={20} aria-hidden="true" />
                    </Menu.Trigger>
                    <Menu.Portal>
                        <Menu.Positioner sideOffset={6} align="end">
                            <Menu.Popup className="library-menu">
                                <span className="library-menu-label">
                                    Status de leitura
                                </span>
                                {userBookStatusOptions.map((option) => (
                                    <Menu.Item
                                        key={option.value}
                                        onClick={() =>
                                            onUpdate({ status: option.value })
                                        }
                                        disabled={book.status === option.value}
                                    >
                                        <span>{option.label}</span>
                                        {book.status === option.value && (
                                            <Check
                                                size={15}
                                                aria-hidden="true"
                                            />
                                        )}
                                    </Menu.Item>
                                ))}
                                <Menu.Separator className="library-menu-divider" />
                                {onAdd && (
                                    <Menu.Item onClick={onAdd}>
                                        Adicionar a uma estante
                                    </Menu.Item>
                                )}
                                {onDetach && (
                                    <Menu.Item onClick={onDetach}>
                                        Retirar desta estante
                                    </Menu.Item>
                                )}
                                <Menu.Item
                                    className="library-danger"
                                    onClick={onRemove}
                                >
                                    <Trash2 size={15} aria-hidden="true" />
                                    Remover da biblioteca
                                </Menu.Item>
                            </Menu.Popup>
                        </Menu.Positioner>
                    </Menu.Portal>
                </Menu.Root>
            </div>
            {busy && (
                <p className="library-book-feedback" role="status">
                    Salvando...
                </p>
            )}
            {error && (
                <p className="library-book-error" role="alert">
                    {error}
                </p>
            )}
        </article>
    );
}
