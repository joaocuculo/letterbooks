import type { ReactNode } from 'react';
import { BookOpen, CircleAlert, LoaderCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Feedback({ kind = 'info', title, children, action, className }: {
    kind?: 'info' | 'loading' | 'error' | 'empty';
    title: string;
    children?: ReactNode;
    action?: ReactNode;
    className?: string;
}) {
    const Icon = { info: Info, loading: LoaderCircle, error: CircleAlert, empty: BookOpen }[kind];
    return (
        <div className={cn('ui-feedback', className)} data-kind={kind}
            role={kind === 'error' ? 'alert' : kind === 'loading' ? 'status' : undefined}>
            <Icon aria-hidden="true" className={kind === 'loading' ? 'ui-spinner' : undefined} />
            <div>
                <strong>{title}</strong>
                {children && <p>{children}</p>}
                {action && <div className="ui-feedback-action">{action}</div>}
            </div>
        </div>
    );
}
