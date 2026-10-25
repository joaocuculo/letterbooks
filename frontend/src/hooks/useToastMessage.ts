import { useEffect, useRef } from 'react';
import { toast } from '../components/ui/toast-manager';

// Preserve existing form/navigation state while presenting its confirmation once.
export function useToastMessage(message: string | null) {
    const previous = useRef<string | null>(null);
    useEffect(() => {
        if (message && message !== previous.current)
            toast.add({ title: message, type: 'success' });
        previous.current = message;
    }, [message]);
}
