import { BookOpen, Heart } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { BookCardResponse } from '../types/book';

interface Props {
    book: BookCardResponse;
    detailed?: boolean;
    busy: boolean;
    onFavorite: (book: BookCardResponse) => void;
}

export default function ExploreBookCard({
    book,
    detailed = false,
    busy,
    onFavorite,
}: Props) {
    const [brokenImage, setBrokenImage] = useState(false);
    return (
        <article
            className={`explore-book${detailed ? ' explore-book-detailed' : ''}`}
        >
            <Link
                className="explore-cover"
                to={`/books/${encodeURIComponent(book.id)}`}
                aria-label={`Ver ${book.title}`}
            >
                {book.thumbnailUrl && !brokenImage ? (
                    <img
                        src={book.thumbnailUrl}
                        alt={book.title}
                        loading="lazy"
                        width="200"
                        height="300"
                        onError={() => setBrokenImage(true)}
                    />
                ) : (
                    <span className="explore-cover-placeholder">
                        <BookOpen size={36} aria-hidden="true" />
                        <span>Capa indisponível</span>
                    </span>
                )}
            </Link>
            <div className="explore-book-info">
                <h3>
                    <Link to={`/books/${encodeURIComponent(book.id)}`}>
                        {book.title}
                    </Link>
                </h3>
                <p>
                    {book.authors?.filter(Boolean).join(', ') ||
                        'Autor não informado.'}
                </p>
                {detailed && (
                    <div className="explore-book-metadata">
                        <p>{book.publisher || 'Editora não informada.'}</p>
                        <p>{book.publishedDate || 'Data não informada.'}</p>
                    </div>
                )}
                <button
                    className="explore-favorite"
                    type="button"
                    aria-pressed={book.isFavorite}
                    aria-label={`${book.isFavorite ? 'Remover dos favoritos' : 'Favoritar'}: ${book.title}`}
                    disabled={busy}
                    onClick={() => onFavorite(book)}
                >
                    <Heart
                        size={17}
                        fill={book.isFavorite ? 'currentColor' : 'none'}
                        aria-hidden="true"
                    />
                    {busy
                        ? 'Salvando...'
                        : book.isFavorite
                          ? 'Favoritado'
                          : 'Favoritar'}
                </button>
            </div>
        </article>
    );
}
