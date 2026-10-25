import RatingHistoryItem from '../../components/RatingHistoryItem';
import { toast } from '../../components/ui/toast-manager';
import { useState, type ReactNode } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import type { UserBookResponse } from '../../types/userBook';
import type { RatingResponse } from '../../types/rating';
import type { UserResponse } from '../../types/user';
import { Button } from '../../components/ui/button';
import { Feedback } from '../../components/ui/feedback';
import LibraryBookCard from '../../components/LibraryBookCard';
import LibraryBareBookCard from '../../components/LibraryBareBookCard';
import UserBookCard from '../../components/UserBookCard';
import LibraryShelfPreview from '../../components/LibraryShelfPreview';
import ShelfActionsMenu from '../../components/ShelfActionsMenu';
import ShelfEditorDialog from '../../components/ShelfEditorDialog';
import BookRelationshipControls from '../../components/BookRelationshipControls';
import BookCover from '../../components/BookCover';
import RatingForm from '../../components/RatingForm';
import RatingsList from '../../components/RatingsList';
import { RatingStars } from '../../components/StarRating';
import SiteHeader from '../../components/SiteHeader';
import Footer from '../../components/Footer';
import {
    AdminPager,
    AdminFailure,
    AdminConfirm,
} from '../../components/admin/AdminControls';
import '../../styles/my-books.css';
import '../../styles/book-details.css';
import '../../styles/admin.css';

const date = '2026-01-15T12:00:00';
const cover =
    'data:image/svg+xml,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><rect width="200" height="300" fill="#202323"/><text x="100" y="140" text-anchor="middle" fill="#fff" font-size="18">CAPA LOCAL</text></svg>'
    );
const book = {
    id: 101,
    googleBooksId: 'local-styleguide-book',
    title: 'O silêncio entre as páginas',
    thumbnailUrl: null,
};
const shelfBooks = [
    '9780140444308',
    '9780140283334',
    '9780061120084',
    '9780060850524',
].map((isbn, index) => ({
    ...book,
    id: 110 + index,
    googleBooksId: `local-styleguide-shelf-${index}`,
    thumbnailUrl: `/images/books/${isbn}.jpg`,
}));
const initialUserBook: UserBookResponse = {
    id: 201,
    status: 'READING',
    isFavorite: false,
    currentPage: 42,
    book,
    user: { id: 301, name: 'Pessoa de demonstração' },
    startedAt: null,
    finishedAt: null,
    createdAt: date,
    updatedAt: date,
};
const sampleRating: RatingResponse = {
    id: 401,
    score: 3,
    comment:
        'Uma impressão de leitura fictícia, usada apenas neste laboratório.',
    user: { id: 301, name: 'Pessoa de demonstração' },
    book,
    createdAt: date,
    updatedAt: date,
};
const sampleUser: UserResponse = {
    id: 301,
    name: 'Pessoa de demonstração',
    email: 'demo@example.test',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: date,
};

function LocalNavigation({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserResponse | null>(sampleUser);
    const [message, setMessage] = useState(
        'Sessão fictícia; links não navegam neste exemplo.'
    );
    return (
        <AuthContext
            value={{
                token: null,
                user,
                isAuthenticated: user !== null,
                isLoadingUser: false,
                userErrorMessage: null,
                signIn: () => setUser(sampleUser),
                signOut: () => {
                    setUser(null);
                    setMessage('Logout simulado, sem alterar a sessão real.');
                },
                refreshUser: () => {},
            }}
        >
            <div
                className="sg-navigation-example landing"
                onClickCapture={(event) => {
                    if ((event.target as Element).closest('a')) {
                        event.preventDefault();
                        setMessage(
                            'Destino preservado no componente; navegação interceptada apenas na demonstração.'
                        );
                    }
                }}
            >
                {children}
            </div>
            <p className="sg-caption" role="status">
                {message}
            </p>
            <Button
                variant="outline"
                onClick={() => setUser(user ? null : sampleUser)}
            >
                {user
                    ? 'Ver como visitante'
                    : 'Ver como administrador fictício'}
            </Button>
        </AuthContext>
    );
}

export function LibraryExamples() {
    const notify = (title: string) => toast.add({ title });
    const [record, setRecord] = useState<UserBookResponse | null>(
        initialUserBook
    );

    const [editing, setEditing] = useState(false);
    const [fail, setFail] = useState(false);
    const [name, setName] = useState('Histórias favoritas');
    return (
        <>
            <div
                className="sg-row sg-domain-books"
                onClickCapture={(event) => {
                    if ((event.target as Element).closest('a')) {
                        event.preventDefault();
                        notify('Detalhes interceptados no laboratório.');
                    }
                }}
            >
                <div className="sg-book">
                    <LibraryBookCard
                        book={record ?? initialUserBook}
                        busy={false}
                        onUpdate={(change) => {
                            setRecord((r) => ({
                                ...(r ?? initialUserBook),
                                ...change,
                            }));
                            notify('Relação pessoal atualizada localmente.');
                        }}
                        onRemove={() =>
                            notify(
                                'Pedido de remoção recebido pelo exemplo local.'
                            )
                        }
                        onAdd={() =>
                            notify(
                                'Pedido de inclusão em estante recebido localmente.'
                            )
                        }
                    />
                </div>
                <div className="sg-book">
                    <LibraryBareBookCard
                        book={book}
                        onAdd={() => notify('Inclusão local solicitada.')}
                        onDetach={() => notify('Retirada local solicitada.')}
                    />
                </div>
                <UserBookCard
                    userBook={record ?? initialUserBook}
                    onRemove={() =>
                        notify('Remoção do card legado solicitada localmente.')
                    }
                />
            </div>
            <div className="sg-spaced">
                <BookRelationshipControls
                    userBook={record}
                    isAuthenticated
                    isLoading={false}
                    isSaving={false}
                    errorMessage={null}
                    onFavoriteToggle={() =>
                        setRecord((r) => ({
                            ...(r ?? initialUserBook),
                            isFavorite: !r?.isFavorite,
                        }))
                    }
                    onStatusChange={(status) =>
                        setRecord((r) => ({
                            ...(r ?? initialUserBook),
                            status,
                        }))
                    }
                    onAddToShelf={() =>
                        notify('Abrir seleção de estantes (demonstração).')
                    }
                    onRemove={() => {
                        setRecord(null);
                        notify('Relação removida apenas da demonstração.');
                    }}
                />
            </div>
            <div className="sg-row sg-spaced library-consolidated">
                <div className="sg-shelf-tile shelf-tile">
                    <LibraryShelfPreview
                        label={name}
                        books={shelfBooks}
                        total={shelfBooks.length}
                        busy={false}
                        onOpen={() => notify('Estante aberta localmente.')}
                        onRetry={() => notify('Nova tentativa local.')}
                    />
                    <ShelfActionsMenu
                        name={name}
                        onEdit={() => setEditing(true)}
                        onDelete={() =>
                            notify(
                                'Pedido de exclusão recebido; nenhum dado foi excluído.'
                            )
                        }
                    />
                </div>
                <div className="sg-shelf-tile">
                    <LibraryShelfPreview
                        label="Estante vazia"
                        books={[]}
                        total={0}
                        busy={false}
                        onOpen={() => notify('Estante vazia aberta.')}
                        onRetry={() => {}}
                    />
                </div>
            </div>
            <div className="sg-row sg-spaced">
                <Button variant="outline" onClick={() => setEditing(true)}>
                    Criar estante local
                </Button>
                <label className="sg-checkbox">
                    <input
                        type="checkbox"
                        checked={fail}
                        onChange={(e) => setFail(e.target.checked)}
                    />
                    Simular erro ao salvar
                </label>
            </div>
            {editing && (
                <ShelfEditorDialog
                    save={async (data) => {
                        await new Promise((resolve) =>
                            setTimeout(resolve, 500)
                        );
                        if (fail) throw new Error('Falha simulada');
                        return {
                            id: 501,
                            ...data,
                            createdAt: date,
                            updatedAt: date,
                        };
                    }}
                    onClose={() => setEditing(false)}
                    onSaved={(shelf) => {
                        setName(shelf.name);
                        notify('Estante salva somente na memória do exemplo.');
                        setEditing(false);
                    }}
                />
            )}
        </>
    );
}

export function RatingExamples() {
    const notify = (title: string) => toast.add({ title });
    const [rating, setRating] = useState<RatingResponse | null>(sampleRating);
    const [editing, setEditing] = useState(false);
    const [removing, setRemoving] = useState(false);

    return (
        <>
            <div className="sg-row">
                <span>Nota pessoal:</span>
                <RatingStars score={rating?.score ?? 0} />
                <Button
                    variant="outline"
                    onClick={() => {
                        setRating(null);
                    }}
                >
                    Nova avaliação local
                </Button>
            </div>
            <RatingsList
                ratings={[
                    {
                        ...sampleRating,
                        id: 9999,
                        user: { ...sampleRating.user, name: 'Outra pessoa' },
                        comment: 'Uma segunda opinião fictícia.',
                    },
                    ...(rating ? [rating] : []),
                ]}
                ownRating={rating}
                onEdit={() => setEditing(true)}
                onDelete={() => setRemoving(true)}
                editor={
                    !rating || editing ? (
                        <>
                            <RatingForm
                                key={rating?.id ?? 'new'}
                                rating={rating}
                                isSaving={false}
                                errorMessage={null}
                                onCancelEditing={
                                    rating ? () => setEditing(false) : undefined
                                }
                                onSave={(data) => {
                                    setRating({
                                        ...sampleRating,
                                        score: data.score,
                                        comment: data.comment ?? null,
                                    });
                                    setEditing(false);
                                    notify(
                                        'Avaliação salva apenas neste exemplo.'
                                    );
                                }}
                            />
                        </>
                    ) : undefined
                }
            />
            {removing && (
                <AdminConfirm
                    title="Excluir avaliação local?"
                    description="Esta ação afeta somente os dados fictícios do laboratório."
                    action="Excluir avaliação local"
                    busy={false}
                    error=""
                    onClose={() => setRemoving(false)}
                    onConfirm={() => {
                        setRating(null);
                        setRemoving(false);
                        notify('Avaliação local excluída.');
                    }}
                />
            )}
            <div className="sg-row">
                <BookCover src={cover} title="Capa ampliável de demonstração" />
                <BookCover title="Capa indisponível de demonstração" />
            </div>
        </>
    );
}

export function NavigationExamples() {
    return (
        <LocalNavigation>
            <SiteHeader />
            <Footer />
        </LocalNavigation>
    );
}

export function AdminExamples() {
    const notify = (title: string) => toast.add({ title });
    const [page, setPage] = useState(0);
    const [failure, setFailure] = useState(true);
    const [confirm, setConfirm] = useState(false);

    return (
        <>
            <AdminPager
                page={page}
                total={3}
                busy={false}
                onChange={setPage}
                label="Paginação administrativa local"
            />
            {failure ? (
                <AdminFailure
                    message="Falha fictícia ao carregar o catálogo."
                    retry={() => setFailure(false)}
                />
            ) : (
                <Feedback title="Catálogo local recuperado" />
            )}
            <Button
                variant="outline"
                className="sg-spaced"
                onClick={() => setConfirm(true)}
            >
                Abrir confirmação administrativa
            </Button>
            {confirm && (
                <AdminConfirm
                    title="Confirmar operação de demonstração?"
                    description="Este diálogo não acessa endpoints nem altera registros reais."
                    action="Confirmar exemplo"
                    busy={false}
                    error=""
                    onClose={() => setConfirm(false)}
                    onConfirm={() => {
                        setConfirm(false);
                        notify('Operação administrativa simulada.');
                    }}
                />
            )}
        </>
    );
}

export function RatingHistoryExamples() {
    return (
        <div
            onClickCapture={(event) => {
                if ((event.target as Element).closest('a')) {
                    event.preventDefault();
                    toast.add({
                        title: 'Navegação simulada para os detalhes do livro.',
                    });
                }
            }}
        >
            <RatingHistoryItem
                rating={{
                    ...sampleRating,
                    id: 801,
                    updatedAt: '2026-02-01T12:00:00',
                    book: {
                        ...sampleRating.book,
                        thumbnailUrl: cover,
                        title: 'Um título extenso para conferir a apresentação do histórico de avaliações',
                    },
                    comment:
                        'Uma impressão de leitura fictícia, com espaço para reler os detalhes que marcaram a experiência.\n'.repeat(
                            14
                        ),
                }}
            />
            <RatingHistoryItem
                rating={{
                    ...sampleRating,
                    id: 802,
                    book: {
                        ...sampleRating.book,
                        title: 'Um livro avaliado sem comentário',
                        thumbnailUrl: null,
                    },
                    comment: null,
                }}
            />
        </div>
    );
}
