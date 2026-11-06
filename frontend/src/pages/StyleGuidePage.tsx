import StyleGuideLayout, {
    Section,
    PreviewPanel,
} from './styleguide/StyleGuideLayout';
import TableExamples from './styleguide/TableExamples';
import { RatingHistoryExamples } from './styleguide/DomainExamples';
import ShelfPickerExample from './styleguide/ShelfPickerExample';
import { Switch } from '../components/ui/switch';
import { toast } from '../components/ui/toast-manager';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectItem,
} from '../components/ui/select';
import { useId, useState } from 'react';
import { ArrowRight, BookOpen, LibraryBig, Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from '../components/ui/tooltip';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '../components/ui/dialog';
import { Feedback } from '../components/ui/feedback';
import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerTitle,
    DrawerDescription,
    DrawerClose,
} from '../components/Drawer';
import {
    BookCardFrame,
    BookFavoriteButton,
    BookOptionsMenu,
    BookRating,
} from '../components/BookCardFrame';
import PasswordInput from '../components/PasswordInput';
import {
    LibraryExamples,
    RatingExamples,
    NavigationExamples,
    AdminExamples,
} from './styleguide/DomainExamples';
import '../styles/styleguide.css';

function BookSpecimen({
    title,
    missing = false,
    busy = false,
    detailed = false,
}: {
    title: string;
    missing?: boolean;
    busy?: boolean;
    detailed?: boolean;
}) {
    const [favorite, setFavorite] = useState(false);
    const [saving, setSaving] = useState(false);
    const pending = busy || saving;
    const cover =
        'data:image/svg+xml,' +
        encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><rect width="200" height="300" fill="#202323"/><rect x="12" y="12" width="176" height="276" fill="none" stroke="#fff"/><text x="100" y="110" text-anchor="middle" fill="#fff" font-family="serif" font-size="18">AS HORAS</text><text x="100" y="138" text-anchor="middle" fill="#fff" font-family="serif" font-size="18">EM BRANCO</text><text x="100" y="250" text-anchor="middle" fill="#fff" font-size="12">CAPA FICTÍCIA</text></svg>'
        );
    return (
        <div
            className={detailed ? 'sg-book sg-book-detailed' : 'sg-book'}
            onClickCapture={(event) => {
                if ((event.target as Element).closest('a')) {
                    event.preventDefault();
                    toast.add({
                        title: 'Link de detalhes: demonstração local.',
                    });
                }
            }}
        >
            <BookCardFrame
                title={title}
                detailed={detailed}
                googleBooksId="styleguide-local-book"
                thumbnailUrl={missing ? null : cover}
                busy={pending}
                actions={
                    <>
                        <BookFavoriteButton
                            title={title}
                            favorite={favorite}
                            busy={pending}
                            onClick={async () => {
                                setSaving(true);
                                try {
                                    await toast.promise(
                                        new Promise<void>((resolve) =>
                                            setTimeout(resolve, 1000)
                                        ),
                                        {
                                            loading: 'Salvando favorito...',
                                            success:
                                                'Favorito atualizado no exemplo.',
                                            error: 'Falha simulada.',
                                        }
                                    );
                                    setFavorite((v) => !v);
                                } finally {
                                    setSaving(false);
                                }
                            }}
                        />
                        <BookOptionsMenu title={title} busy={pending}>
                            <DropdownMenuItem
                                onClick={() =>
                                    toast.add({
                                        title: 'Livro adicionado à estante de demonstração.',
                                        type: 'success',
                                    })
                                }
                            >
                                <LibraryBig aria-hidden="true" />
                                Adicionar a uma estante
                            </DropdownMenuItem>
                        </BookOptionsMenu>
                    </>
                }
            >
                <p className="book-item-authors">
                    {missing
                        ? 'Um nome de autor bastante extenso para inspecionar'
                        : 'Marina de Castro'}
                </p>
                <BookRating averageRating={missing ? null : 4.25} />
            </BookCardFrame>
        </div>
    );
}

export default function StyleGuidePage() {
    const id = useId();
    const [notice, setNotice] = useState('Nenhuma ação executada.');
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('reading');
    const [submitted, setSubmitted] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [localName, setLocalName] = useState('Minha estante');
    const [retry, setRetry] = useState(false);
    const [publicShelf, setPublicShelf] = useState(false);
    return (
        <StyleGuideLayout>
            <Section id="tokens" title="Cores, superfícies e tokens">
                <div className="sg-swatches">
                    {[
                        ['surface-background', 'Fundo'],
                        ['surface-muted', 'Superfície'],
                        ['surface-subtle', 'Superfície suave'],
                        ['text-primary', 'Texto'],
                        ['text-secondary', 'Texto secundário'],
                        ['border-default', 'Borda'],
                        ['action-primary', 'Ação'],
                    ].map(([token, label]) => (
                        <div key={token}>
                            <span
                                className="sg-swatch"
                                style={{ background: `var(--${token})` }}
                            />
                            <strong>{label}</strong>
                            <code>--{token}</code>
                        </div>
                    ))}
                </div>
                <div className="sg-row sg-token-samples">
                    <span style={{ borderRadius: 'var(--radius-control)' }}>
                        Controle · 10 px
                    </span>
                    <span style={{ borderRadius: 'var(--radius-menu)' }}>
                        Menu · 12 px
                    </span>
                    <span style={{ borderRadius: 'var(--radius-panel)' }}>
                        Painel · 16 px
                    </span>
                    <span style={{ borderRadius: 'var(--radius-book)' }}>
                        BookCard · 18 px
                    </span>
                </div>
                <p className="sg-caption">
                    Espaçamentos: 4, 8, 12, 16, 20, 24, 32 e 40 px. Controles
                    compactos: 36 px; BookCard: 38 px.
                </p>
            </Section>
            <Section id="type" title="Tipografia">
                <div className="sg-type-samples">
                    <h3>Manrope — um lugar para cada leitura</h3>
                    <p>
                        Interface de 14 px. Títulos com peso semibold e textos
                        secundários discretos.
                    </p>
                    <small>Texto auxiliar · 12 px</small>
                </div>
            </Section>
            <Section id="buttons" title="Botões e variantes">
                <PreviewPanel title="Variantes">
                    <div className="sg-row">
                        {(
                            [
                                'default',
                                'outline',
                                'secondary',
                                'ghost',
                                'link',
                                'destructive',
                            ] as const
                        ).map((variant) => (
                            <Button
                                key={variant}
                                variant={variant}
                                onClick={() =>
                                    setNotice(`Variante ${variant} acionada.`)
                                }
                            >
                                {variant}
                            </Button>
                        ))}
                    </div>
                </PreviewPanel>
                <PreviewPanel title="Tamanhos e estados">
                    <div className="sg-row">
                        {(['xs', 'sm', 'default', 'lg'] as const).map(
                            (size) => (
                                <Button
                                    key={size}
                                    variant="outline"
                                    size={size}
                                    onClick={() =>
                                        setNotice(`Tamanho ${size} acionado.`)
                                    }
                                >
                                    {size}
                                </Button>
                            )
                        )}
                        <Button
                            size="icon"
                            variant="outline"
                            aria-label="Adicionar exemplo"
                            onClick={() => setNotice('Adicionar acionado.')}
                        >
                            <Plus />
                        </Button>
                        <Button disabled>Desabilitado</Button>
                        <Button loading>Salvando...</Button>
                    </div>
                </PreviewPanel>
                <p className="sg-caption" role="status">
                    {notice}
                </p>
            </Section>
            <Section id="fields" title="Inputs, textareas e selects">
                <form
                    className="sg-fields"
                    onSubmit={(event) => {
                        event.preventDefault();
                        setSubmitted(true);
                    }}
                >
                    <label className="sg-field">
                        Busca local
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Título ou autor"
                        />
                    </label>
                    <label className="sg-field">
                        Campo desabilitado
                        <Input disabled defaultValue="Somente demonstração" />
                    </label>
                    <label className="sg-field">
                        Campo inválido
                        <Input
                            aria-invalid="true"
                            aria-describedby={`${id}-error`}
                            defaultValue="valor incompleto"
                        />
                        <small id={`${id}-error`}>
                            Exemplo de mensagem de validação.
                        </small>
                    </label>
                    <label className="sg-field">
                        Senha de demonstração
                        <PasswordInput
                            id={`${id}-password`}
                            visibilityLabel="senha de demonstração"
                            defaultValue="exemplo-local"
                        />
                    </label>
                    <div className="sg-field">
                        <label htmlFor="sg-shadcn-select">
                            Status de leitura
                        </label>
                        <Select
                            items={[
                                { value: 'reading', label: 'Lendo' },
                                { value: 'completed', label: 'Lido' },
                            ]}
                            value={status}
                            onValueChange={(value) => {
                                if (value) setStatus(value);
                            }}
                        >
                            <SelectTrigger id="sg-shadcn-select">
                                <SelectValue placeholder="Selecione um status" />
                            </SelectTrigger>
                            <SelectContent alignItemWithTrigger={false}>
                                <SelectGroup>
                                    <SelectItem value="reading">
                                        Lendo
                                    </SelectItem>
                                    <SelectItem value="completed">
                                        Lido
                                    </SelectItem>
                                    <SelectItem value="unavailable" disabled>
                                        Indisponível
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="sg-field">
                        <label htmlFor="sg-compact-select">
                            Select compacto
                        </label>
                        <Select
                            items={[{ value: 'all', label: 'Todos os livros' }]}
                            defaultValue="all"
                        >
                            <SelectTrigger id="sg-compact-select" size="sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent alignItemWithTrigger={false}>
                                <SelectGroup>
                                    <SelectItem value="all">
                                        Todos os livros
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="sg-field">
                        <label htmlFor="sg-disabled-select">
                            Select desabilitado
                        </label>
                        <Select disabled>
                            <SelectTrigger id="sg-disabled-select">
                                <SelectValue placeholder="Sem seleção" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="reading">
                                        Lendo
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <label className="sg-field">
                        Notas locais
                        <Textarea
                            placeholder="Uma impressão sobre a leitura..."
                            rows={3}
                        />
                    </label>
                    <label className="sg-field">
                        Textarea desabilitada
                        <Textarea disabled defaultValue="Texto de exemplo" />
                    </label>
                    <div className="sg-row">
                        <Button type="submit">
                            Testar formulário
                            <ArrowRight />
                        </Button>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setSubmitted(false)}
                        >
                            Limpar resultado
                        </Button>
                    </div>
                    <p className="sg-caption" role="status">
                        {submitted
                            ? `Formulário tratado localmente. Busca: ${query || 'vazia'}.`
                            : 'O formulário não envia dados para a API.'}
                    </p>
                </form>
            </Section>
            <Section id="menus" title="DropdownMenu e Tooltip">
                <div className="sg-row">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={<Button variant="outline" />}
                        >
                            Abrir menu
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem
                                onClick={() =>
                                    setNotice('Opção do menu selecionada.')
                                }
                            >
                                <BookOpen />
                                Ver exemplo
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>
                                <LibraryBig />
                                Ação indisponível
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() =>
                                    setNotice(
                                        'Remoção simulada; nenhum dado foi excluído.'
                                    )
                                }
                            >
                                <Trash2 />
                                Remover exemplo
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Tooltip>
                        <TooltipTrigger render={<Button variant="ghost" />}>
                            Ajuda por hover ou foco
                        </TooltipTrigger>
                        <TooltipContent>
                            Uma ajuda curta e contextual.
                        </TooltipContent>
                    </Tooltip>
                </div>
            </Section>
            <Section id="panels" title="Dialog e Drawer">
                <div className="sg-row">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger render={<Button variant="outline" />}>
                            Abrir diálogo
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    Estante de demonstração
                                </DialogTitle>
                                <DialogDescription>
                                    Edite um nome local para inspecionar o
                                    formulário e o foco.
                                </DialogDescription>
                            </DialogHeader>
                            <label className="sg-field">
                                Nome da estante
                                <Input
                                    value={localName}
                                    onChange={(event) =>
                                        setLocalName(event.target.value)
                                    }
                                />
                            </label>
                            <DialogFooter>
                                <DialogClose
                                    render={<Button variant="outline" />}
                                >
                                    Cancelar
                                </DialogClose>
                                <Button
                                    onClick={() => {
                                        setNotice(`Nome local: ${localName}`);
                                        setDialogOpen(false);
                                    }}
                                >
                                    Salvar exemplo
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Drawer>
                        <DrawerTrigger render={<Button variant="outline" />}>
                            Abrir drawer
                        </DrawerTrigger>
                        <DrawerContent className="sg-drawer">
                            <DrawerTitle>Filtros de demonstração</DrawerTitle>
                            <DrawerDescription>
                                O mesmo Drawer utilizado no Explorar.
                            </DrawerDescription>
                            <label className="sg-field sg-spaced">
                                Autor
                                <Input placeholder="Nome do autor" />
                            </label>
                            <DrawerClose
                                render={
                                    <Button
                                        variant="outline"
                                        className="sg-spaced"
                                    />
                                }
                            >
                                Fechar drawer
                            </DrawerClose>
                        </DrawerContent>
                    </Drawer>
                </div>
            </Section>
            <Section id="notifications" title="Switch e toasts">
                <div className="sg-fields">
                    <div className="sg-switch-row">
                        <label htmlFor="sg-public-shelf">Estante pública</label>
                        <Switch
                            id="sg-public-shelf"
                            checked={publicShelf}
                            onCheckedChange={setPublicShelf}
                        />
                    </div>
                    <div className="sg-switch-row">
                        <label htmlFor="sg-disabled-switch">
                            Switch desabilitado
                        </label>
                        <Switch id="sg-disabled-switch" disabled checked />
                    </div>
                </div>
                <div className="sg-row sg-spaced">
                    <Button
                        variant="outline"
                        onClick={() =>
                            toast.add({
                                title: 'Exemplo de notificação',
                                description:
                                    'Mensagem local, sem chamada à API.',
                            })
                        }
                    >
                        Toast normal
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() =>
                            toast.add({
                                title: 'Estante salva.',
                                type: 'success',
                            })
                        }
                    >
                        Toast de sucesso
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            void toast
                                .promise(
                                    new Promise<void>((resolve) =>
                                        setTimeout(resolve, 1600)
                                    ),
                                    {
                                        loading: 'Salvando...',
                                        success:
                                            'Alterações salvas no exemplo.',
                                        error: 'Não foi possível salvar.',
                                    }
                                )
                                .catch(() => {});
                        }}
                    >
                        Promise com sucesso
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            void toast
                                .promise(
                                    new Promise<void>((_, reject) =>
                                        setTimeout(
                                            () =>
                                                reject(
                                                    new Error('Falha simulada')
                                                ),
                                            1600
                                        )
                                    ),
                                    {
                                        loading: 'Salvando...',
                                        success: 'Alterações salvas.',
                                        error: 'Falha simulada ao salvar. Tente novamente.',
                                    }
                                )
                                .catch(() => {});
                        }}
                    >
                        Promise com erro
                    </Button>
                </div>
            </Section>
            <Section id="feedback" title="Loading, erro, vazio e disabled">
                <div className="sg-feedback-grid">
                    <Feedback kind="loading" title="Carregando livros">
                        Aguarde um instante.
                    </Feedback>
                    <Feedback
                        kind={retry ? 'info' : 'error'}
                        title={
                            retry
                                ? 'Exemplo recuperado'
                                : 'Não foi possível carregar'
                        }
                        action={
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRetry((v) => !v)}
                            >
                                {retry ? 'Simular erro' : 'Tentar novamente'}
                            </Button>
                        }
                    >
                        Estado simulado, sem requisição de rede.
                    </Feedback>
                    <Feedback kind="empty" title="Sua estante está vazia">
                        Os próximos livros aparecerão aqui.
                    </Feedback>
                </div>
            </Section>
            <Section id="books" title="BookCard — referência do LetterBooks">
                <p className="sg-caption">
                    Favoritos, menu e links são tratados localmente. Notas e
                    capas são fictícias.
                </p>
                <div className="sg-row sg-books">
                    <BookSpecimen title="As horas em branco" />
                    <BookSpecimen
                        title="Um título longo para conferir a composição em duas linhas"
                        missing
                    />
                    <BookSpecimen title="Livro em salvamento" busy />
                </div>
                <div className="sg-row sg-spaced">
                    <BookSpecimen
                        title="Card detalhado — ações fora da capa"
                        detailed
                    />
                </div>
            </Section>
            <Section id="library" title="Biblioteca e estantes">
                <LibraryExamples />
                <ShelfPickerExample />
            </Section>
            <Section id="ratings" title="Avaliações">
                <RatingExamples />
                <h3 className="sg-spaced">Histórico — Minhas avaliações</h3>
                <RatingHistoryExamples />
            </Section>
            <Section id="navigation" title="Navegação">
                <NavigationExamples />
            </Section>
            <Section id="tables" title="Tabelas e dados estruturados">
                <TableExamples />
            </Section>
            <Section id="admin" title="Administração">
                <AdminExamples />
            </Section>
        </StyleGuideLayout>
    );
}
