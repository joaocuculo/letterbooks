import type { ReactNode, Ref } from 'react';
import UserAvatar from './UserAvatar';
import { Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from './ui/dropdown-menu';
import { Feedback } from './ui/feedback';
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
                <UserAvatar name={rating.user.name} />
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
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={<Button variant="ghost" size="icon" />}
                            aria-label="Opções da sua avaliação"
                        >
                            <Ellipsis size={20} aria-hidden="true" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={6}>
                            <DropdownMenuItem onClick={onEdit}>
                                <Pencil size={15} aria-hidden="true" />
                                Editar avaliação
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={onDelete}
                                variant="destructive"
                            >
                                <Trash2 size={15} aria-hidden="true" />
                                Excluir avaliação
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
            {rating.comment && (
                <p className="book-rating-comment">{rating.comment}</p>
            )}
        </article>
    );
}
export default function RatingsList({
    ratings, ownRating, onEdit, onDelete, editor, feedback, headingRef,
}: {
    ratings: RatingResponse[];
    ownRating?: RatingResponse | null;
    onEdit?: () => void;
    onDelete?: () => void;
    editor?: ReactNode;
    feedback?: ReactNode;
    headingRef?: Ref<HTMLHeadingElement>;
}) {
    const others = ratings.filter(rating => rating.id !== ownRating?.id);
    return (
        <section className="book-readers" aria-labelledby="book-readers-title">
            <h2 id="book-readers-title" ref={headingRef} tabIndex={-1}>Avaliações</h2>
            {editor ? <div className="book-my-rating">{editor}</div> : ownRating && (
                <RatingEntry rating={ownRating} own onEdit={onEdit} onDelete={onDelete} />
            )}
            {feedback || (others.length ? others.map(rating => (
                <RatingEntry key={rating.id} rating={rating} />
            )) : !ownRating && (
                <Feedback kind="empty" title="Este livro ainda não possui avaliações." />
            ))}
        </section>
    );
}
