# Tabelas administrativas
Referências: https://ui.shadcn.com/docs/components/base/data-table e https://ui.shadcn.com/docs/components/base/table.

## Implementação
- Primitivos semânticos Table, TableHeader, TableBody, TableRow, TableHead, TableCell e TableCaption; TableState compartilha vazio, carregamento e erro.
- CSS usa tokens existentes, cabeçalhos discretos, separadores horizontais, hover e foco, com rolagem horizontal em uma região nomeada acessível pelo teclado.
- Usuários: identidade e ID, e-mail, papel, situação monocromática, cadastro e ação visível. O botão Alterar conta mantém o nome acessível completo, o diálogo existente e o bloqueio de alteração da própria conta.
- CatalogList atende autores e categorias; Gerenciar preserva o retorno à página original.
- CatalogDetails usa tabelas nos nomes e na seleção da origem para união. Rádios, operações, confirmações e bloqueios continuam existentes.
- PaginationControls, Button, Badge, AdminFailure e componentes Base UI existentes foram reutilizados. Não houve adição de dependência de runtime.
- Grades de livros, estantes e avaliações foram mantidas. Não foram encontradas outras tabelas administrativas além destes fluxos.
- Não foi adicionado TanStack Table: a ordenação usa o parâmetro sort já suportado pelo endpoint, sem precisar de um motor de tabelas.
- StyleGuidePage importa TableExamples somente pelo caminho de desenvolvimento já isolado. Exemplos têm dados locais e nenhuma requisição.

## Verificação
Build, lint e ambos os scripts de isolamento do styleguide passaram. Build emite aviso de chunk principal acima de 500 kB.
No navegador: apresentação em desktop e 390 px; menu aberto por Enter e fechado por Escape; paginação local e limites; estados vazio e carregamento; rolagem horizontal por ArrowRight.
As rotas administrativas redirecionaram ao login por ausência de sessão. Operações reais de criação, alteração de conta, nomes e união, bem como paginação com API, ainda precisam de validação autenticada. Os handlers e serviços foram preservados e revisados no diff.
Usuários permite ordenar por nome, e-mail e cadastro em ambos os sentidos. A ordenação é armazenada na URL, aplicada no servidor e reinicia a paginação. Parâmetros inválidos usam createdAt,desc. Busca e filtros não foram adicionados.

## Recomendações separadas
Busca e ordenação das demais listagens podem ser avaliadas em outra rodada. Não filtrar somente a página carregada, pois isso produziria resultados incompletos. TanStack pode ser reavaliado se esses requisitos surgirem.

## Ajustes após revisão
Botões de conta usam Pencil + Editar. TableSortHead compartilha controles com ArrowUpDown, indicação da direção ativa, aria-sort e suporte ao teclado. Style Guide ordena todos os dados fictícios antes de paginar. Verificados alternância ascendente/descendente por Enter e retorno à página 1 ao trocar coluna.
