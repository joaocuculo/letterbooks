# Minha Biblioteca

`/my-books` é a superfície autenticada da biblioteca pessoal e abre Todos com vinte livros por página. Abas sublinhadas oferecem Todos, Quero ler, Lendo, Lidos, Abandonados, Favoritos e Estantes. A consolidação encerrou os quatro protótipos Estantes, Coleção, Lista e Grade e removeu o resumo de agrupamentos. Estantes agora identifica somente coleções personalizadas.

## Navegação e consultas

A biblioteca consulta `GET /user-books/me` com `size=20`, `sort=updatedAt,desc` e o filtro ativo. Escolher uma aba reinicia a página. Favoritos podem combinar com status por URL. Paginação base zero é recuperável por histórico e recarga; páginas que deixam de existir são ajustadas à última disponível, no mínimo zero.

| Parâmetro da URL | Comportamento |
| --- | --- |
| `status` | Aceita READING, WANT_TO_READ, COMPLETED e ABANDONED; inválidos não filtram. |
| `favorite=true` | Filtra favoritos e pode combinar com status. |
| `page` | Inteiro não negativo; inválidos usam zero. |
| `view=all` | Abre Todos, que também é o padrão sem filtros. |
| `view=shelves` | Abre estantes personalizadas. |
| `shelfId` | Identifica o detalhe da estante dentro de Estantes. |

`/my-books/list` redireciona com replace para `/my-books`, preservando parâmetros e compatibilidade com filtros combinados. Abrir e usar o diálogo Adicionar a uma estante conserva pesquisa, página e URL de origem.

## Livros e estantes

Favoritar envia `PATCH /user-books/{id}` com `isFavorite`; escolher status usa o mesmo endpoint com `status`. Remover da biblioteca envia `DELETE /user-books/{id}` após confirmação. Capa e título abrem `/books/:googleBooksId`; progresso existente é somente leitura. `useMyBooks` bloqueia e informa erro por livro, aplica mudanças somente após sucesso e refaz a consulta ativa. AbortController e controle de geração impedem aplicar respostas obsoletas. Falha de remoção mantém a confirmação para nova tentativa; cancelar não altera dados.

Estantes lista `GET /bookshelves/user/{userId}` com `page`, `size=20` e `sort=createdAt,desc`. Cada prévia mostra nome, total e até quatro capas distintas. Abrir uma estante consulta resumo e livros paginados na mesma superfície, mostrando nome, descrição e visibilidade. Criar usa `POST /bookshelves`; editar, `PATCH /bookshelves/{id}`. O diálogo aceita nome até 100 caracteres e descrição até 1000; Pública inicia desmarcada. Erro ao salvar conserva os campos. `DELETE /bookshelves/{id}` exige confirmação que informa a preservação dos livros na biblioteca. Retirar da estante usa `DELETE /bookshelves/{id}/book/{bookId}` e preserva a relação pessoal; Remover da biblioteca continua sendo uma ação separada. Ao excluir a última estante de uma página, a paginação é ajustada.

Adicionar a uma estante aparece na biblioteca e nas visualizações compacta e detalhada do Explorar. O diálogo oferece seleção única e consulta associações reais por `GET /bookshelves/book/google/{googleBooksId}/me`; estantes já associadas ficam desabilitadas e identificadas. Criar dentro do diálogo seleciona automaticamente a nova estante. Visitantes seguem ao login com retorno contendo caminho, query e fragmento. Carregamento, vazio e falha com Tentar novamente são explícitos; envio bloqueia a ação e falha mantém o diálogo.

## Contratos de backend

`BookshelfSummaryDTO` acrescenta `previewBooks`, com até quatro livros por estante ordenados por ID crescente. A listagem consulta contagens e prévias em lote para os IDs da página: duas consultas agrupadas além da consulta paginada, sem uma consulta por estante. Posições sem livro não repetem capas.

`GET /bookshelves/{id}/summary` retorna metadados, contagem e prévias. `GET /bookshelves/{id}/books` retorna livros paginados com `book` e `userBook` nulo quando não há relação pessoal. Essa relação sempre pertence ao autenticado, inclusive ao consultar uma estante pública de outra pessoa. A autorização de estantes privadas e a propriedade para mutações são preservadas. O detalhe antigo `GET /bookshelves/{id}` permanece compatível.

Um único `POST /bookshelves/{id}/book` recebe `googleBooksId`, verifica propriedade e duplicidade e associa o livro. Quando falta a relação pessoal, cria `WANT_TO_READ` com `isFavorite=false` na mesma transação. Relações existentes preservam status, favorito e progresso. Não há novas dependências ou migrações.

## Apresentação e acesso

SiteHeader e a identidade neutra compacta são reutilizados: Manrope local, corpo 14px, título 28–32px e capas trazendo cor. Abas quebram linhas; a grade de livros passa de quatro para duas colunas abaixo de 1024px e para uma abaixo de 380px. Capas de livros usam proporção 2:3, imagem inteira e fallback “Sem capa”. Somente a página rola.

Estantes usam mosaicos quadrados de aproximadamente 200px, com quatro posições iguais em 2×2 e `object-fit: cover`, sem deformação. Posições vazias são neutras. A grade conserva duas estantes por fileira em 320px. Nome e total ficam abaixo do mosaico; o menu oferece editar/excluir. Diálogos Base UI mantêm foco modal, margem na viewport e rolagem em alturas insuficientes. Ícones Lucide, ações e controles usam área mínima de 44px e foco visível. Favorito expõe `aria-pressed`, livro informa `aria-busy`, campos têm rótulos; mensagens de estado/sucesso usam `role="status"` e erros usam `role="alert"` e vermelho existente. O link para Biblioteca no diálogo também tem altura mínima de 44px.

## Validação registrada

Build e lint passaram. Dez testes de backend passaram, cobrindo propriedade, duplicidade, paginação, relação pessoal do autenticado, prévias limitadas e chamadas em lote, criação/preservação de relação e rollback pelo Spring TransactionInterceptor com mocks. Isso verifica o limite transacional em teste, sem integração com banco. Hibernate compilou as consultas JPQL sem conexão a banco.

Navegador com API simulada verificou CRUD de estantes, privada/pública, nome duplicado, editar e cancelar/confirmar exclusão; seleção com associações existentes desabilitadas, criação inline e seleção automática; adição pelo Explorar com URL de pesquisa intacta; retirada preservando a biblioteca; falha ao salvar conservando campos; redirecionamento de visitantes ao login com retorno configurado para a origem. Com 21 estantes, excluir a única da segunda página retornou à página zero e mostrou vinte itens. URL legada com status/favorito combinados ajustou página inválida; histórico simulado restaurou seleções.

As seis capturas `.impeccable/review/library-{books,shelves,add}-{desktop,mobile}.png` documentam livros, estantes e diálogo em 1440×1000 e 320×700. Todas foram validadas. Tablet 768px e viewport 640×500 foram conferidos por DOM, sem overflow horizontal; a segunda verifica reflow, não zoom real. Revisão independente completa identificou somente a área de toque do link para Biblioteca; após elevar sua altura a 44px, a revisão final independente dessa correção concluiu ship. A revisão inicial não registrou outros achados materiais.

Os testes de navegador e capturas usam dados simulados e não comprovam operações com conta real. Capturas `my-books-*` e verificações dos modelos anteriores são histórico de protótipos, sem aprovação atual ou comparação pendente. Pesquisa textual na biblioteca, edição de progresso, estatísticas e ações em lote ficam fora desta entrega.

O launcher Impeccable falhou com `cache_directory_failed`; foi usado o fallback manual declarado. Esta extensão é code-led e herda o mundo existente, sem comp aprovada e sem execução do detector Impeccable. Frontmatter de DESIGN.md e `.impeccable/design.json` permanecem preservados; drift preexistente de tokens fica fora do escopo.
