import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { toast } from '../../components/ui/toast-manager';
import ShelfPickerDialog from '../../components/ShelfPickerDialog';
import ShelfEditorDialog from '../../components/ShelfEditorDialog';
import ActiveSearchFilters from '../../components/ActiveSearchFilters';

export default function ShelfPickerExample() {
    const [open, setOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [busy, setBusy] = useState(false);
    const [empty, setEmpty] = useState(false);
    const [choices, setChoices] = useState(
        Array.from({ length: 30 }, (_, i) => ({
            id: i + 1,
            name:
                i === 0
                    ? 'Estante que já contém o livro'
                    : `Estante de demonstração ${i + 1}`,
            containsBook: i === 0,
        }))
    );
    return (
        <div
            onClickCapture={(event) => {
                if ((event.target as Element).closest('a')) {
                    event.preventDefault();
                    toast.add({ title: 'Navegação simulada: suas estantes.' });
                }
            }}
        >
            <ActiveSearchFilters
                items={[
                    { label: 'Título', value: 'A Metamorfose' },
                    { label: 'Autor', value: 'Franz Kafka' },
                ]}
            />
            <Button
                className="sg-spaced"
                variant="outline"
                onClick={() => setOpen(true)}
            >
                Adicionar a várias estantes (local)
            </Button>
            <label className="sg-row sg-spaced">
                <input
                    type="checkbox"
                    checked={empty}
                    onChange={(event) => {
                        setEmpty(event.target.checked);
                        setSelected(new Set());
                    }}
                />
                Simular lista de estantes vazia
            </label>
            {open && (
                <ShelfPickerDialog
                    title="Um título de livro bastante longo para conferir a hierarquia e a rolagem independente"
                    choices={empty ? [] : choices}
                    selected={selected}
                    busy={busy}
                    onToggle={(id, checked) =>
                        setSelected((old) => {
                            const next = new Set(old);
                            if (checked) next.add(id);
                            else next.delete(id);
                            return next;
                        })
                    }
                    onClose={() => setOpen(false)}
                    onCreate={() => setCreating(true)}
                    onRetry={() => {}}
                    onAdd={async () => {
                        setBusy(true);
                        await new Promise((resolve) =>
                            setTimeout(resolve, 500)
                        );
                        toast.add({
                            title: `Livro adicionado a ${selected.size} estantes no exemplo.`,
                            type: 'success',
                        });
                        setBusy(false);
                        setOpen(false);
                    }}
                >
                    {creating && (
                        <ShelfEditorDialog
                            onClose={() => setCreating(false)}
                            save={async (data) => ({
                                id: choices.length + 1,
                                ...data,
                                createdAt: '2026-10-21T12:00:00',
                                updatedAt: '2026-10-21T12:00:00',
                            })}
                            onSaved={(shelf) => {
                                setEmpty(false);
                                setChoices((old) => [
                                    { ...shelf, containsBook: false },
                                    ...old,
                                ]);
                                setSelected(
                                    (old) => new Set([...old, shelf.id])
                                );
                                setCreating(false);
                            }}
                        />
                    )}
                </ShelfPickerDialog>
            )}
        </div>
    );
}
