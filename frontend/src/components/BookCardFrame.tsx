import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Ellipsis, Heart, Star } from 'lucide-react';
import { Card, CardContent, CardFooter, CardTitle } from './ui/card';
import { Button } from './ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from './ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { cn } from '@/lib/utils';
import '../styles/book-card.css';

interface BookCardFrameProps {
    title: string;
    googleBooksId: string;
    thumbnailUrl: string | null;
    detailed?: boolean;
    busy?: boolean;
    children: ReactNode;
    actions: ReactNode;
    feedback?: ReactNode;
}

export function BookCardFrame({
    title,
    googleBooksId,
    thumbnailUrl,
    detailed,
    busy,
    children,
    actions,
    feedback,
}: BookCardFrameProps) {
    const location = useLocation();
    const linkState = {
        from: location.pathname + location.search + location.hash,
    };
    const [failedSource, setFailedSource] = useState<string | null>(null);
    const source = thumbnailUrl?.replace(/^http:/, 'https:');
    const href = `/books/${encodeURIComponent(googleBooksId)}`;

    return (
        <Card
            role="article"
            aria-label={title}
            aria-busy={busy || undefined}
            className={cn(
                'book-item-card',
                detailed && 'book-item-card-detailed'
            )}
        >
            <div className="book-item-media">
                <Link
                    className="book-item-cover"
                    to={href}
                    state={linkState}
                    aria-label={`Ver detalhes de ${title}`}
                >
                    {source && failedSource !== source ? (
                        <img
                            src={source}
                            alt={`Capa de ${title}`}
                            width={200}
                            height={300}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={() => setFailedSource(source)}
                        />
                    ) : (
                        <span className="book-item-cover-missing">
                            <BookOpen size={32} aria-hidden="true" />
                            <span>Capa indisponível</span>
                        </span>
                    )}
                </Link>
                {!detailed && (
                    <div
                        className="book-item-actions"
                        role="group"
                        aria-label={`Ações de ${title}`}
                    >
                        {actions}
                    </div>
                )}
            </div>
            {detailed && (
                <div
                    className="book-item-actions book-item-actions-detailed"
                    role="group"
                    aria-label={`Ações de ${title}`}
                >
                    {actions}
                </div>
            )}
            <CardContent className="book-item-content">
                <CardTitle className="book-item-title">
                    <h3>
                        <TooltipProvider delay={300}>
                            <Tooltip>
                                <TooltipTrigger
                                    render={
                                        <Link
                                            to={href}
                                            state={linkState}
                                            className="book-item-title-link"
                                        />
                                    }
                                >
                                    {title}
                                </TooltipTrigger>
                                <TooltipContent>{title}</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </h3>
                </CardTitle>
                <div className="book-item-description">{children}</div>
            </CardContent>
            {feedback && (
                <CardFooter className="book-item-footer">
                    <div className="book-item-feedback">{feedback}</div>
                </CardFooter>
            )}
        </Card>
    );
}

export function BookFavoriteButton({
    title,
    favorite,
    busy,
    onClick,
}: {
    title: string;
    favorite: boolean;
    busy: boolean;
    onClick: () => void;
}) {
    return (
        <Button
            variant="outline"
            size="icon"
            className="book-item-favorite"
            aria-pressed={favorite}
            aria-label={`${favorite ? 'Remover dos favoritos' : 'Favoritar'}: ${title}`}
            disabled={busy}
            onClick={onClick}
        >
            <Heart
                fill={favorite ? 'currentColor' : 'none'}
                aria-hidden="true"
            />
        </Button>
    );
}

export function BookOptionsMenu({
    title,
    busy,
    children,
}: {
    title: string;
    busy?: boolean;
    children: ReactNode;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                disabled={busy}
                aria-label={`Opções de ${title}`}
                render={
                    <Button
                        variant="outline"
                        size="icon"
                        className="book-item-options"
                    />
                }
            >
                <Ellipsis aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="book-item-menu"
                align="end"
                sideOffset={6}
            >
                {children}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

const ratingFormatter = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
});

export function BookRating({
    averageRating,
}: {
    averageRating: number | null;
}) {
    const rated = averageRating !== null && Number.isFinite(averageRating);
    const label = rated
        ? ratingFormatter.format(averageRating)
        : 'Sem avaliações';
    return (
        <p
            className={cn(
                'book-item-rating',
                rated && 'book-item-rating-rated'
            )}
            aria-label={rated ? `Média das avaliações: ${label} de 5` : label}
        >
            <Star
                size={15}
                fill={rated ? 'currentColor' : 'none'}
                aria-hidden="true"
            />
            <span>{label}</span>
        </p>
    );
}
