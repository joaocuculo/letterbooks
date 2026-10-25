import '../styles/book-card.css';
import { Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from './ui/dropdown-menu';

export default function ShelfActionsMenu({
    name,
    onEdit,
    onDelete,
}: {
    name: string;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className="library-shelf-menu"
                aria-label={`Opções da estante ${name}`}
                render={<Button variant="outline" size="icon" />}
            >
                <Ellipsis aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={6}>
                <DropdownMenuItem onClick={onEdit}>
                    <Pencil aria-hidden="true" />
                    Editar estante
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={onDelete}>
                    <Trash2 aria-hidden="true" />
                    Excluir estante
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
