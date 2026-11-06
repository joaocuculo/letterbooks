import { useEffect, useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerTitle,
    DrawerDescription,
    DrawerClose,
} from '../../components/Drawer';

const sectionGroups = [
    {
        title: 'Fundamentos',
        items: [
            {
                id: 'tokens',
                label: 'Cores e tokens',
                description:
                    'A base visual do LetterBooks: cores, espaçamentos e superfícies.',
            },
            {
                id: 'type',
                label: 'Tipografia',
                description:
                    'Escala de texto e hierarquia com a fonte Manrope.',
            },
        ],
    },
    {
        title: 'Componentes básicos',
        items: [
            {
                id: 'buttons',
                label: 'Botões',
                description:
                    'Variantes, tamanhos e estados para as ações da interface.',
            },
            {
                id: 'fields',
                label: 'Campos',
                description:
                    'Entradas de texto, seletores e validação em formulários.',
                framed: true,
            },
            {
                id: 'menus',
                label: 'Menus e tooltips',
                description: 'Ações contextuais e informações de apoio.',
                framed: true,
            },
            {
                id: 'panels',
                label: 'Dialog e Drawer',
                description:
                    'Superfícies para tarefas que precisam de contexto e foco.',
                framed: true,
            },
            {
                id: 'notifications',
                label: 'Switches e toasts',
                description: 'Preferências e notificações de operações locais.',
                framed: true,
            },
            {
                id: 'feedback',
                label: 'Estados e feedback',
                description: 'Carregamento, falhas e estados vazios.',
                framed: true,
            },
        ],
    },
    {
        title: 'Componentes LetterBooks',
        items: [
            {
                id: 'books',
                label: 'BookCard',
                description:
                    'Capas, informações de leitura e ações do catálogo.',
                framed: true,
            },
            {
                id: 'library',
                label: 'Biblioteca e estantes',
                description: 'Organização da biblioteca e seleção de estantes.',
            },
            {
                id: 'ratings',
                label: 'Avaliações',
                description: 'Notas, comentários e histórico de leitura.',
            },
            {
                id: 'navigation',
                label: 'Navegação',
                description:
                    'Cabeçalho e rodapé nos diferentes estados da sessão.',
            },
        ],
    },
    {
        title: 'Administração',
        items: [
            {
                id: 'tables',
                label: 'Tabelas',
                description:
                    'Dados estruturados, ações por registro e paginação.',
            },
            {
                id: 'admin',
                label: 'Componentes administrativos',
                description: 'Paginação, recuperação de erros e confirmações.',
                framed: true,
            },
        ],
    },
];
const sections = sectionGroups.flatMap((group) => group.items);

export function PreviewPanel({
    title,
    children,
}: {
    title?: string;
    children: ReactNode;
}) {
    return (
        <div className="sg-preview">
            {title && <h3 className="sg-preview-title">{title}</h3>}
            {children}
        </div>
    );
}
export function Section({
    id,
    title,
    children,
}: {
    id: string;
    title: string;
    children: ReactNode;
}) {
    const definition = sections.find((section) => section.id === id);
    return (
        <section id={id} className="sg-section" aria-labelledby={id + '-title'}>
            <header className="sg-section-header">
                <h2 id={id + '-title'} tabIndex={-1}>
                    {title}
                </h2>
                <p>{definition?.description}</p>
            </header>
            {definition?.framed ? (
                <PreviewPanel>{children}</PreviewPanel>
            ) : (
                children
            )}
        </section>
    );
}
export default function StyleGuideLayout({
    children,
}: {
    children: ReactNode;
}) {
    const [active, setActive] = useState('tokens');
    const [open, setOpen] = useState(false);
    useEffect(() => {
        if (open) return;
        let frame = 0;
        const update = () => {
            frame = 0;
            const elements = sections
                .map((section) => document.getElementById(section.id))
                .filter((element): element is HTMLElement => !!element);
            const passed = elements.filter(
                (element) =>
                    element.getBoundingClientRect().top <=
                    Math.max(140, window.innerHeight * 0.3)
            );
            const atBottom =
                window.scrollY > 0 &&
                window.innerHeight + window.scrollY >=
                    document.documentElement.scrollHeight - 4;
            setActive(
                (atBottom ? elements.at(-1) : (passed.at(-1) ?? elements[0]))
                    ?.id ?? 'tokens'
            );
        };
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };
        schedule();
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        window.addEventListener('hashchange', schedule);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', schedule);
            window.removeEventListener('hashchange', schedule);
        };
    }, [open]);
    const navigation = (mobile: boolean) => (
        <nav
            className="sg-doc-nav"
            aria-label={
                mobile
                    ? 'Seções do Style Guide no celular'
                    : 'Seções do Style Guide'
            }
        >
            {sectionGroups.map((group) => (
                <div className="sg-nav-group" key={group.title}>
                    <h2>{group.title}</h2>
                    <ul>
                        {group.items.map((section) => (
                            <li key={section.id}>
                                <a
                                    href={'#' + section.id}
                                    aria-current={
                                        active === section.id
                                            ? 'location'
                                            : undefined
                                    }
                                    onClick={() => {
                                        setActive(section.id);
                                        if (mobile) setOpen(false);
                                    }}
                                >
                                    {section.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </nav>
    );
    return (
        <div
            className="styleguide"
            data-development-page="LETTERBOOKS_STYLEGUIDE_DEV_ONLY"
        >
            <a className="sg-skip" href="#sg-content">
                Pular para os exemplos
            </a>
            <aside className="sg-sidebar">
                <a className="sg-brand" href="#sg-content">
                    LetterBooks<span>Style Guide · Desenvolvimento</span>
                </a>
                {navigation(false)}
            </aside>
            <div className="sg-mobile-bar">
                <span>LetterBooks / Style Guide</span>
                <Drawer open={open} onOpenChange={setOpen}>
                    <DrawerTrigger
                        render={<Button variant="outline" size="sm" />}
                    >
                        <Menu aria-hidden="true" />
                        Seções
                    </DrawerTrigger>
                    <DrawerContent className="sg-nav-drawer">
                        <div className="sg-drawer-heading">
                            <DrawerTitle>Navegar pelo Style Guide</DrawerTitle>
                            <DrawerClose
                                render={
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label="Fechar navegação"
                                    />
                                }
                            >
                                <X aria-hidden="true" />
                            </DrawerClose>
                        </div>
                        <DrawerDescription>
                            Componentes e fundamentos do LetterBooks.
                        </DrawerDescription>
                        {navigation(true)}
                    </DrawerContent>
                </Drawer>
            </div>
            <main id="sg-content" className="sg-content" tabIndex={-1}>
                <header className="sg-header">
                    <span className="sg-eyebrow">
                        Design System / LetterBooks
                    </span>
                    <h1>Laboratório visual</h1>
                    <p>
                        Componentes reais, dados fictícios e interações locais.
                        Nenhuma alteração é salva.
                    </p>
                </header>
                {children}
            </main>
        </div>
    );
}
