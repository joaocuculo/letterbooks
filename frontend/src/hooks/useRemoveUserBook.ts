import { toast } from '../components/ui/toast-manager';
import { useState } from 'react';
import { remove } from '../services/userBookService';
import type { UserBookResponse } from '../types/userBook';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';

interface UseRemoveUserBookOptions {
    onRemoved: (userBook: UserBookResponse) => void;
}

export function useRemoveUserBook({ onRemoved }: UseRemoveUserBookOptions) {
    const [removingUserBookId, setRemovingUserBookId] = useState<number | null>(
        null
    );
    const [removeErrorMessage, setRemoveErrorMessage] = useState<string | null>(
        null
    );

    async function removeFromLibrary(userBook: UserBookResponse) {
        const confirmed = window.confirm(
            `Deseja remover "${userBook.book.title}" da sua biblioteca?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setRemovingUserBookId(userBook.id);
            setRemoveErrorMessage(null);

            await toast.promise(remove(userBook.id), {
                loading: 'Removendo livro...',
                success: 'Livro removido da biblioteca.',
                error: (error) =>
                    getApiErrorMessage(
                        error,
                        'Não foi possível remover o livro da sua biblioteca.'
                    ),
            });
            onRemoved(userBook);
        } catch (error) {
            setRemoveErrorMessage(
                getApiErrorMessage(
                    error,
                    'Não foi possível remover o livro da sua biblioteca.'
                )
            );
        } finally {
            setRemovingUserBookId(null);
        }
    }

    return {
        removingUserBookId,
        removeErrorMessage,
        removeFromLibrary,
    };
}
