import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Ellipsis, Pencil, Trash2 } from 'lucide-react';
import type { RatingResponse } from '../types/rating';
import { RatingStars } from './StarRating';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from './ui/dropdown-menu';
import '../styles/my-ratings.css';

export default function RatingHistoryItem({
    rating,
}: {
    rating: RatingResponse;
}) {
    const location = useLocation();
    const from = location.pathname + location.search + location.hash;
    const href = `/books/${encodeURIComponent(rating.book.googleBooksId)}`;
    const [failed, setFailed] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [truncated, setTruncated] = useState(false);
    const comment = useRef<HTMLParagraphElement>(null);
    useEffect(() => {
        const element = comment.current;
        if (!element || expanded) return;
        const check = () =>
            setTruncated(element.scrollHeight > element.clientHeight + 1);
        check();
        const observer = new ResizeObserver(check);
        observer.observe(element);
        return () => observer.disconnect();
    }, [rating.comment, expanded]);
    const date = (value: string) => new Date(value).toLocaleDateString('pt-BR');
    return (
        <article
            className="rating-history-item"
            aria-label={`Sua avaliação de ${rating.book.title}`}
        >
            <Link
                className="rating-history-cover"
                to={href}
                state={{ from }}
                aria-label={`Ver detalhes de ${rating.book.title}`}
            >
                {rating.book.thumbnailUrl && !failed ? (
                    <img
                        src={rating.book.thumbnailUrl.replace(
                            /^http:/,
                            'https:'
                        )}
                        alt={`Capa de ${rating.book.title}`}
                        loading="lazy"
                        width={80}
                        height={120}
                        onError={() => setFailed(true)}
                    />
                ) : (
                    <BookOpen aria-label="Capa indisponível" />
                )}
            </Link>
            <div className="rating-history-info">
                <h2>
                    <Link to={href} state={{ from }}>
                        {rating.book.title}
                    </Link>
                </h2>
                <RatingStars score={rating.score} />
                <p className="rating-history-date">
                    Publicada em{' '}
                    <time dateTime={rating.createdAt}>
                        {date(rating.createdAt)}
                    </time>
                    {new Date(rating.updatedAt).getTime() >
                        new Date(rating.createdAt).getTime() && (
                        <>
                            {' '}
                            · Editada em{' '}
                            <time dateTime={rating.updatedAt}>
                                {date(rating.updatedAt)}
                            </time>
                        </>
                    )}
                </p>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rating-history-menu"
                        />
                    }
                    aria-label={`Opções da avaliação de ${rating.book.title}`}
                >
                    <Ellipsis aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        render={
                            <Link
                                to={href}
                                state={{
                                    from,
                                    ratingAction: 'edit',
                                    ratingId: rating.id,
                                }}
                            />
                        }
                    >
                        <Pencil aria-hidden="true" />
                        Editar avaliação
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        variant="destructive"
                        render={
                            <Link
                                to={href}
                                state={{
                                    from,
                                    ratingAction: 'delete',
                                    ratingId: rating.id,
                                }}
                            />
                        }
                    >
                        <Trash2 aria-hidden="true" />
                        Excluir avaliação
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            {rating.comment?.trim() && (
                <div className="rating-history-comment">
                    <p
                        id={`rating-comment-${rating.id}`}
                        ref={comment}
                        className={expanded ? '' : 'rating-history-clamped'}
                    >
                        {rating.comment}
                    </p>
                    {(truncated || expanded) && (
                        <Button
                            type="button"
                            variant="link"
                            aria-expanded={expanded}
                            aria-controls={`rating-comment-${rating.id}`}
                            onClick={() => setExpanded((value) => !value)}
                        >
                            {expanded ? 'Mostrar menos' : 'Ler mais'}
                        </Button>
                    )}
                </div>
            )}
        </article>
    );
}
