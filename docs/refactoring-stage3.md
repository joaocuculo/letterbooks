# Etapa 3 — Componentes específicos do LetterBooks

Aplicação incremental dos tokens monocromáticos e dos componentes da Etapa 2. Não houve alteração em backend, DTOs, serviços, endpoints, autenticação, autorização, rotas ou estrutura das páginas da aplicação.

## Conjuntos e decisões

| Conjunto | Alterações |
| --- | --- |
| Livros | `UserBookCard` reutiliza `BookCardFrame` e seu menu, mantendo status, favorito textual, página atual e callback de remoção. `BookCover` reutiliza Button no fechamento da ampliação. O lightbox permanece especializado; não se força a composição de um diálogo de formulário sobre uma imagem em tela cheia. |
| Cards aprovados | `BookCardFrame`, `BookCard`, `ExploreBookCard`, `LibraryBookCard`, `LibraryBareBookCard`, `BookFavoriteButton`, `BookOptionsMenu` e `BookRating` já compartilhavam os controles. Foram analisados e preservados. Sem dados de autoria ou média no contrato da biblioteca, esses valores não foram inventados. |
| Estantes | `ShelfManager` e `AddToShelfDialog` reutilizam Button, Dialog e Feedback. `ShelfActionsMenu` substitui o menu customizado. `LibraryShelfPreview` mantém o botão de composição específico da prévia; retry/loading/erro usam os componentes compartilhados. |
| Editor | `ShelfEditorDialog` contém o mesmo estado, validação, limites de comprimento, bloqueio de fechamento e tratamento assíncrono do editor anterior. Recebe a operação de salvar por callback. `ShelfEditor` continua conectando exatamente `saveShelf`, com as mesmas props públicas. O laboratório usa o mesmo diálogo com uma função em memória. |
| Relação pessoal | `BookRelationshipControls` reutiliza Button, NativeSelect e Feedback, mantendo callbacks e valores de status. `MyBooksSection` reutiliza o estado vazio compartilhado e mantém seus destinos. |
| Avaliações | `RatingForm` usa Button, Textarea e Feedback para erro de operação; mensagens de validação ligadas por IDs continuam inline. `RatingEntry` usa DropdownMenu. `RatingsList` usa Feedback vazio. `StarRating` e `RatingStars` mantêm rádios e notas de 0 a 5, com o traço das estrelas alinhado à média do card. A média pública continua independente da nota pessoal. |
| Navegação | `NavigationMenu` compartilha a composição de menu e `AccountMenu` preserva destinos e visibilidade administrativa. `SiteHeader` mantém a organização existente e usa esses componentes. `NavBar` preserva seus destinos, filtros de status e logout com redirecionamento; os antigos menus details foram migrados. `Footer` e NavBar usam superfícies neutras. `BrandLogo` e `AdminShell` já atendiam à identidade/composição compartilhada e foram mantidos. |
| Administração | `AdminPager`, `AdminFailure` e `AdminConfirm` usam controles e feedback compartilhados. `CatalogList`, `CatalogDetails` e seu `MergeSection` reutilizam Button/Input/Dialog onde aplicável. Rádios de origem, locks, paginação, confirmação, finalFocus, mensagens e operações foram preservados. |

Botões que dependiam do submit implícito agora têm `type="submit"` explícito. Ações de cancelar e menus continuam sem submeter formulários. Loading foi ligado às flags existentes, sem criar novos estados de negócio.

## Duplicações eliminadas

- Renderização independente da capa e informações do card legado substituída pelo frame comum.
- Composição repetida de Portal/Backdrop/Popup em formulários e confirmações substituída por DialogContent.
- Menus de avaliações, estantes e conta usam o mesmo DropdownMenu e posicionamento em portal.
- CSS obsoleto de `book-rating-menu`, `library-menu` e `landing-user-menu` foi retirado após a migração dos consumidores.
- Regras legadas de campos de estantes foram removidas. Seletores genéricos administrativos e de detalhes deixam de sobrescrever os novos controles; permanecem compatíveis com os controles nativos das páginas ainda não migradas.

## Style Guide

Os exemplos anteriores permanecem. Novas demonstrações em `pages/styleguide/DomainExamples.tsx`:

- Biblioteca: LibraryBookCard, LibraryBareBookCard, UserBookCard, relação pessoal, prévia vazia/preenchida, menu e editor real de estantes, com salvamento e erro simulados.
- Avaliações: entrada própria, criação/edição, validação obrigatória, nota zero, comentários, exclusão confirmada, estado vazio, estrelas e BookCover com ampliação/fallback.
- Navegação: SiteHeader, AccountMenu e Footer com AuthContext local. Visitante/administrador e logout são simulados; links não saem do laboratório.
- Administração: paginação, falha/retry e confirmação usando os componentes reais com callbacks locais.

Os containers com hooks de dados (`ShelfManager`, `AddToShelfDialog`, `CatalogList`, `CatalogDetails`) não são montados no laboratório. As partes reais que usam para a apresentação/ações são demonstradas sem duplicar operações internas. NavBar mantém seu redirecionamento real de logout e não é montado no laboratório para evitar navegação involuntária para uma rota conectada.

`check:styleguide-isolation` percorre imports de execução, ignorando tipos, e verifica que os exemplos não alcançam serviços da API, AuthProvider real ou chamadas diretas de rede. Isso é uma proteção estática; não substitui um monitor completo de tráfego de terceiros. A restrição `import.meta.env.DEV`, lazy import e registro de rota não foram modificados. A verificação de produção também busca os marcadores exclusivos das novas fixtures.

## Arquivos desta etapa

- Componentes alterados: BookCover, BookRelationshipControls, UserBookCard, MyBooksSection, LibraryShelfPreview, ShelfManager, ShelfEditor, AddToShelfDialog, RatingForm, RatingsList/RatingEntry, StarRating/RatingStars, SiteHeader, NavBar, Footer; admin/AdminControls, admin/CatalogList e admin/CatalogDetails/MergeSection.
- Novos componentes: AccountMenu, NavigationMenu, ShelfActionsMenu e ShelfEditorDialog.
- CSS: novo domain-components.css; index.css importa essa composição; admin.css, book-details.css, home.css, profile.css e my-books.css perdem estilos duplicados ou passam a respeitar os controles compartilhados.
- Laboratório: StyleGuidePage.tsx, styleguide/DomainExamples.tsx, styleguide.css.
- Verificações: scripts/verify-styleguide-isolation.mjs, scripts/verify-styleguide-production.mjs e package.json.

## Verificação e limites

- Build, lint, check:styleguide-production e check:styleguide-isolation.
- Conferência de 49 expressões de eventos/callbacks dos componentes conectados contra o início desta etapa, preservando sua implementação (com a chamada de saveShelf agora injetada como save).
- Navegador: nome obrigatório, salvamento local/bloqueio dos controles, erro de estante e retorno de foco; validação de nota, zero, edição, comentário com trim, exclusão confirmada e vazio; menu de conta, links interceptados e logout simulado; paginação e Escape na confirmação administrativa.
- Responsividade em 390 e 320 px sem overflow horizontal no laboratório; diálogo de estante dentro do viewport; controles dos cards medidos em 38 × 38 px.
- Sem persistência nem operações administrativas em contas reais. O build mantém o aviso existente de bundle JavaScript acima de 500 kB.

## Pendências da Etapa 4

- Revisar as páginas completas em todos os breakpoints e em Safari/iOS e leitores de tela; o laboratório não substitui essa revisão.
- Migrar controles inline ainda presentes nas páginas, como remoção em MyBooksPage, confirmações em BookDetailsPage e ferramentas de UsersAdminPage, sem alterar as operações.
- Avaliar o shell de fallback de AppLayout e sua superfície legada, sem reestruturar rotas nesta etapa.
- Identificados como legados: DiscoverPage sem registro em App; SearchForm sem consumidor encontrado; MyBooksSection/UserBookCard sem consumidor ativo de página. Foram preservados. NavBar e Footer continuam usados pelo fallback, portanto não são código morto.
- `SearchPage` e `MyBooksListPage` são redirecionamentos de compatibilidade, não candidatos automáticos a remoção.

A Etapa 4 não foi iniciada.
