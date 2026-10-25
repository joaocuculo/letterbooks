import { useCallback, useEffect, useState, type SubmitEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import RatingHistoryItem from '../components/RatingHistoryItem';
import PaginationControls from '../components/PaginationControls';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Feedback } from '../components/ui/feedback';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '../components/ui/select';
import { findMine } from '../services/ratingService';
import { useLibraryResource } from '../hooks/useLibraryResource';
import '../styles/home.css';
import '../styles/my-ratings.css';

const orders = [
    { value: 'recent', label: 'Mais recentes', sort: 'createdAt,desc' },
    { value: 'oldest', label: 'Mais antigas', sort: 'createdAt,asc' },
    { value: 'highest', label: 'Maior nota', sort: 'score,desc' },
    { value: 'lowest', label: 'Menor nota', sort: 'score,asc' },
];

function History({
    q,
    order,
    page,
    onChange,
}: {
    q: string;
    order: string;
    page: number;
    onChange: (
        changes: { q?: string; order?: string; page?: number },
        replace?: boolean
    ) => void;
}) {
    const [draft, setDraft] = useState(q);
    const [retry, setRetry] = useState(0);
    const sort =
        orders.find((item) => item.value === order)?.sort ?? orders[0].sort;
    const load = useCallback(
        (signal: AbortSignal) => findMine({ q, page, sort }, signal),
        [q, page, sort]
    );
    const state = useLibraryResource(`${q}:${order}:${page}:${retry}`, load);
    useEffect(() => {
        if (
            state.data &&
            !state.busy &&
            !state.error &&
            page > 0 &&
            page >= state.data.page.totalPages
        )
            onChange(
                { page: Math.max(0, state.data.page.totalPages - 1) },
                true
            );
    }, [state.data, state.busy, state.error, page, onChange]);
    function search(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        onChange({ q: draft.trim(), page: 0 });
    }
    return (
        <>
            <div className="rating-history-toolbar">
                <form role="search" onSubmit={search}>
                    <Input
                        aria-label="Pesquisar avaliações por título"
                        placeholder="Buscar por título do livro"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                    />
                    {(q || draft) && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setDraft('');
                                onChange({ q: '', page: 0 });
                            }}
                        >
                            Limpar busca
                        </Button>
                    )}
                </form>
                <Select
                    items={orders}
                    value={order}
                    onValueChange={(value) => {
                        if (orders.some((item) => item.value === value))
                            onChange({ order: value!, page: 0 });
                    }}
                >
                    <SelectTrigger aria-label="Ordenar avaliações">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                        {orders.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {state.busy ? (
                <Feedback
                    kind="loading"
                    title="Carregando suas avaliações..."
                />
            ) : state.error ? (
                <Feedback
                    kind="error"
                    title={state.error}
                    action={
                        <Button
                            variant="outline"
                            onClick={() => setRetry((value) => value + 1)}
                        >
                            Tentar novamente
                        </Button>
                    }
                />
            ) : (
                state.data && (
                    <>
                        <p className="rating-history-count" role="status">
                            {state.data.page.totalElements}{' '}
                            {state.data.page.totalElements === 1
                                ? 'avaliação'
                                : 'avaliações'}
                            {q ? ` para “${q}”` : ''}
                        </p>
                        {state.data.content.length ? (
                            <div>
                                {state.data.content.map((rating) => (
                                    <RatingHistoryItem
                                        key={rating.id}
                                        rating={rating}
                                    />
                                ))}
                            </div>
                        ) : (
                            <Feedback
                                kind="empty"
                                title={
                                    q
                                        ? 'Nenhuma avaliação encontrada para esta busca.'
                                        : 'Você ainda não publicou avaliações.'
                                }
                            >
                                {q
                                    ? 'Tente outro título ou limpe a busca.'
                                    : 'Suas notas e comentários aparecerão aqui após avaliar um livro.'}
                            </Feedback>
                        )}
                        <PaginationControls
                            page={page}
                            total={state.data.page.totalPages}
                            busy={state.busy}
                            onChange={(page) => onChange({ page })}
                            label="Paginação das minhas avaliações"
                        />
                    </>
                )
            )}
        </>
    );
}

export default function MyRatingsPage() {
    const [params, setParams] = useSearchParams();
    const q = params.get('q')?.trim() ?? '';
    const order = orders.some((item) => item.value === params.get('order'))
        ? params.get('order')!
        : 'recent';
    const rawPage = Number(params.get('page') ?? 0);
    const page = Number.isSafeInteger(rawPage) && rawPage >= 0 ? rawPage : 0;
    const onChange = useCallback(
        (
            changes: { q?: string; order?: string; page?: number },
            replace = false
        ) => {
            setParams(
                (previous) => {
                    const next = new URLSearchParams(previous);
                    Object.entries(changes).forEach(([key, value]) => {
                        if (
                            value === '' ||
                            (key === 'page' && value === 0) ||
                            (key === 'order' && value === 'recent')
                        )
                            next.delete(key);
                        else next.set(key, String(value));
                    });
                    return next;
                },
                { replace }
            );
        },
        [setParams]
    );
    return (
        <div className="landing">
            <SiteHeader />
            <main className="rating-history-page">
                <header>
                    <h1>Minhas avaliações</h1>
                    <p>
                        Suas leituras, suas notas e o que ficou de cada livro.
                    </p>
                </header>
                <History
                    key={`${q}:${order}:${page}`}
                    q={q}
                    order={order}
                    page={page}
                    onChange={onChange}
                />
            </main>
        </div>
    );
}
