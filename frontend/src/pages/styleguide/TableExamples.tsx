import { TableSortHead } from '../../components/ui/table-sort-head';
import { useState } from 'react';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    TableState,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import PaginationControls from '../../components/PaginationControls';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '../../components/ui/dropdown-menu';
import { MoreHorizontal, Pencil } from 'lucide-react';
import { toast } from '../../components/ui/toast-manager';

const people = [
    {
        id: 101,
        name: 'Ana Martins',
        email: 'ana@example.test',
        role: 'Administrador',
        active: true,
    },
    {
        id: 102,
        name: 'Bruno Costa',
        email: 'bruno@example.test',
        role: 'Usuário',
        active: false,
    },
    {
        id: 103,
        name: 'Clara Almeida',
        email: 'clara@example.test',
        role: 'Usuário',
        active: true,
    },
    {
        id: 104,
        name: 'Daniel Santos com um nome extenso para testar a leitura',
        email: 'daniel.santos@example.test',
        role: 'Usuário',
        active: true,
    },
];
export default function TableExamples() {
    const [page, setPage] = useState(0);
    const [sort, setSort] = useState<{
        field: 'name' | 'email' | 'createdAt';
        direction: 'asc' | 'desc';
    }>({ field: 'createdAt', direction: 'desc' });
    const changeSort = (field: typeof sort.field) => {
        setSort((previous) => ({
            field,
            direction:
                previous.field === field && previous.direction === 'asc'
                    ? 'desc'
                    : 'asc',
        }));
        setPage(0);
    };
    const sortedPeople = [...people].sort((a, b) => {
        const compared =
            sort.field === 'createdAt'
                ? 0
                : a[sort.field].localeCompare(b[sort.field], 'pt-BR');
        return (sort.direction === 'asc' ? compared : -compared) || a.id - b.id;
    });
    const [state, setState] = useState('ready');
    return (
        <>
            <h3>Tabela simples</h3>
            <Table aria-label="Categorias fictícias">
                <TableHeader>
                    <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Identificador</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>Literatura brasileira</TableCell>
                        <TableCell>12</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Poesia</TableCell>
                        <TableCell>18</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <h3 className="sg-spaced">Usuários, ações e paginação</h3>
            <p className="sg-caption">
                Dados locais. Em telas estreitas, a região recebe foco e permite
                rolagem horizontal. A ação principal permanece visível; o menu
                demonstra ações secundárias.
            </p>
            <div className="sg-row">
                {[
                    ['ready', 'Dados'],
                    ['empty', 'Vazio'],
                    ['loading', 'Carregamento'],
                ].map(([value, label]) => (
                    <Button
                        key={value}
                        size="sm"
                        variant={state === value ? 'secondary' : 'outline'}
                        aria-pressed={state === value}
                        onClick={() => setState(value)}
                    >
                        {label}
                    </Button>
                ))}
            </div>
            <div className="sg-spaced">
                <Table
                    className="ui-table-users"
                    aria-label="Usuários fictícios"
                >
                    <TableHeader>
                        <TableRow>
                            {(
                                [
                                    ['name', 'Usuário'],
                                    ['email', 'E-mail'],
                                ] as const
                            ).map(([field, label]) => (
                                <TableSortHead
                                    key={field}
                                    direction={
                                        sort.field === field
                                            ? sort.direction
                                            : undefined
                                    }
                                    onSort={() => changeSort(field)}
                                >
                                    {label}
                                </TableSortHead>
                            ))}
                            <TableHead>Papel</TableHead>
                            <TableHead>Situação</TableHead>
                            <TableSortHead
                                direction={
                                    sort.field === 'createdAt'
                                        ? sort.direction
                                        : undefined
                                }
                                onSort={() => changeSort('createdAt')}
                            >
                                Cadastro
                            </TableSortHead>
                            <TableHead className="table-actions">
                                Ações
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {state !== 'ready' ? (
                            <TableState
                                columns={6}
                                loading={state === 'loading'}
                            >
                                {state === 'loading'
                                    ? 'Carregando usuários...'
                                    : 'Nenhum usuário cadastrado.'}
                            </TableState>
                        ) : (
                            sortedPeople
                                .slice(page * 2, page * 2 + 2)
                                .map((person) => (
                                    <TableRow key={person.id}>
                                        <TableCell className="table-identity">
                                            {person.name}
                                            <span className="table-secondary">
                                                ID: {person.id}
                                            </span>
                                        </TableCell>
                                        <TableCell>{person.email}</TableCell>
                                        <TableCell className="table-nowrap">
                                            {person.role}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    person.active
                                                        ? 'secondary'
                                                        : 'outline'
                                                }
                                            >
                                                {person.active
                                                    ? 'Ativa'
                                                    : 'Inativa'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="table-nowrap">
                                            05/11/2026
                                        </TableCell>
                                        <TableCell className="table-actions">
                                            <div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    aria-label={
                                                        'Editar papel e situação de ' +
                                                        person.name
                                                    }
                                                    onClick={() =>
                                                        toast.add({
                                                            title:
                                                                'Alteração simulada: ' +
                                                                person.name,
                                                        })
                                                    }
                                                >
                                                    <Pencil aria-hidden="true" />{' '}
                                                    Editar
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        render={
                                                            <Button
                                                                size="icon-sm"
                                                                variant="ghost"
                                                                aria-label={
                                                                    'Mais ações para ' +
                                                                    person.name
                                                                }
                                                            />
                                                        }
                                                    >
                                                        <MoreHorizontal aria-hidden="true" />
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                toast.add({
                                                                    title:
                                                                        'Identificador local: ' +
                                                                        person.id,
                                                                })
                                                            }
                                                        >
                                                            Ver identificador
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
            </div>
            {state === 'ready' && (
                <PaginationControls
                    page={page}
                    total={2}
                    busy={false}
                    onChange={setPage}
                    label="Paginação dos usuários fictícios"
                />
            )}
        </>
    );
}
