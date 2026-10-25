import type { BookSummary } from '../types/book';
import { LibraryBig, BookMinus } from 'lucide-react';
import { BookCardFrame, BookOptionsMenu } from './BookCardFrame';
import { DropdownMenuItem } from './ui/dropdown-menu';

export default function LibraryBareBookCard({ book, onAdd, onDetach }: {
    book: BookSummary;
    onAdd: () => void;
    onDetach: () => void;
}) {
    return (
        <BookCardFrame title={book.title} googleBooksId={book.googleBooksId} thumbnailUrl={book.thumbnailUrl}
            actions={<BookOptionsMenu title={book.title}>
                <DropdownMenuItem onClick={onAdd}><LibraryBig aria-hidden="true" />Adicionar a uma estante</DropdownMenuItem>
                <DropdownMenuItem onClick={onDetach}><BookMinus aria-hidden="true" />Retirar desta estante</DropdownMenuItem>
            </BookOptionsMenu>}>
            <p>Sem status de leitura</p>
        </BookCardFrame>
    );
}
