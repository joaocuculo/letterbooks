import { Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { Menu } from '@base-ui/react/menu';
import { RatingStars } from './StarRating';
import type { RatingResponse } from '../types/rating';

export function RatingEntry({
    rating,
    own = false,
    onEdit,
    onDelete,
}: {
    rating: RatingResponse;
    own?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}) {
    const date = new Date(rating.updatedAt || rating.createdAt);
    return (
        <article
            className={`book-rating-entry${own ? ' book-own-rating' : ''}`}
        >
            <div className="book-rating-heading">
                <div className="book-reader-avatar" aria-hidden="true">
                    {rating.user.name
                        .trim()
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join('')
                        .toUpperCase()}
                </div>
                <div>
                    <strong>{own ? 'Você' : rating.user.name}</strong>
                    {!Number.isNaN(date.getTime()) && (
                        <time dateTime={rating.updatedAt || rating.createdAt}>
                            {date.toLocaleDateString('pt-BR')}
                        </time>
                    )}
                </div>
                <div className="book-rating-score">
                    <RatingStars score={rating.score} />
                </div>
                {own && onEdit && onDelete && (
                    <Menu.Root>
                        <Menu.Trigger
                            className="book-icon-button"
                            aria-label="Opções da sua avaliação"
                        >
                            <Ellipsis size={20} aria-hidden="true" />
                        </Menu.Trigger>
                        <Menu.Portal>
                            <Menu.Positioner sideOffset={6} align="end">
                                <Menu.Popup className="book-rating-menu">
                                    <Menu.Item onClick={onEdit}>
                                        <Pencil size={15} aria-hidden="true" />
                                        Editar avaliação
                                    </Menu.Item>
                                    <Menu.Item
                                        onClick={onDelete}
                                        className="book-danger"
                                    >
                                        <Trash2 size={15} aria-hidden="true" />
                                        Excluir avaliação
                                    </Menu.Item>
                                </Menu.Popup>
                            </Menu.Positioner>
                        </Menu.Portal>
                    </Menu.Root>
                )}
            </div>
            {rating.comment && (
                <p className="book-rating-comment">{rating.comment}</p>
            )}
        </article>
    );
}
export default function RatingsList({
    ratings,
}: {
    ratings: RatingResponse[];
}) {
    return (
        <section className="book-readers" aria-labelledby="book-readers-title">
            <h2 id="book-readers-title">Avaliações dos leitores</h2>
            {ratings.length ? (
                ratings.map((rating) => (
                    <RatingEntry key={rating.id} rating={rating} />
                ))
            ) : (
                <p className="book-muted">
                    Este livro ainda não possui avaliações.
                </p>
            )}
        </section>
    );
}
