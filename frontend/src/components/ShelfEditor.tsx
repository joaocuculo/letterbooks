import {
    saveShelf,
    type BookshelfSummary,
    type SavedShelf,
} from '../services/bookshelfService';
import ShelfEditorDialog from './ShelfEditorDialog';

export default function ShelfEditor(props: {
    shelf?: BookshelfSummary;
    onClose: () => void;
    onSaved: (shelf: SavedShelf) => void;
}) {
    return <ShelfEditorDialog {...props} save={saveShelf} />;
}
