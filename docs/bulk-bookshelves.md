# Seleção de livros e adição a estantes em lote

## Comportamento da interface

Disponível em Leituras, Favoritos, detalhe de estante e Explorar (pesquisa e descoberta). A seleção fica na página atual ou em uma seção da descoberta, limitada a 20 livros. Até 20 estantes podem ser escolhidas entre páginas do seletor. Adicionar mantém os livros nas estantes de origem; não há movimentação nem exclusão em lote.

Selecionar livros ativa checkboxes nos cards, suspende seus links e oculta ações individuais. Clique na área do card ou no checkbox alterna o mesmo item, identificado pelo Google Books ID. Espaço no checkbox permite usar teclado. Selecionar todos tem estado intermediário visual e semântico. Fora desse modo, capas, menus, favoritos e links mantêm o comportamento anterior.

A barra contextual mostra contagem, seleção de todos, Adicionar às estantes e Cancelar. Até 760px, contagem e ações ficam fixas no rodapé, com área segura e espaço reservado para as ações em até três linhas, sem encobrir cards ou paginação. A seleção de todos permanece acima da grade. Os estilos usam tokens neutros existentes.

O seletor reutiliza `ShelfPickerDialog` e `ShelfEditor`: cada destino informa Já contém N de M; estantes completas são desabilitadas. Criar estante preserva a seleção e marca o novo destino. O limite de 20 destinos desabilita novos destinos e criação, mantendo os já selecionados editáveis. Fechar o diálogo preserva os livros; Cancelar seleção os desmarca.

Um provider compartilhado registra um único bloqueador do React Router. A inicialização usa createBrowserRouter/RouterProvider, mantendo as rotas e URLs existentes. Mudanças de página, status, área, pesquisa, seção e navegação SPA pedem Descartar seleção? quando há livros selecionados. Alternar grade compacta/detalhada preserva a seleção. Recarregar/fechar a aba usa aviso nativo, sujeito ao comportamento do navegador. Logout ou troca de usuário limpa o estado. Visitantes são enviados ao login ao ativar a seleção, com retorno à pesquisa de origem.

Durante o envio, seleção, confirmação repetida e fechamento ficam bloqueados. Uma navegação interna bloqueada informa que é necessário aguardar o resultado. Sucesso fecha o diálogo, limpa a seleção, apresenta o total de adições e de vínculos já existentes e reconsulta a origem sem remover os cards durante a atualização. O foco retorna à ação de seleção da origem.

Erros preservam a seleção. Timeout/perda de conexão não significa que o servidor deixou de salvar: a interface informa resultado não confirmado e reconsulta as contagens, incluindo destinos selecionados fora da página, antes de permitir repetir o envio. Se essa consulta falhar, o envio permanece desabilitado. O usuário também pode fechar o diálogo e rever os destinos sem perder os livros.

## Novos contratos do backend

Ambos recebem o usuário da autenticação, sem aceitar userId no corpo. DTO: `BookshelfBulkRequestDTO`.

```json
{
  "googleBooksIds": ["livro-a", "livro-b"],
  "bookshelfIds": [1, 2]
}
```

As duas listas são obrigatórias, não vazias e limitadas a 20 elementos antes da normalização. IDs de estantes devem ser positivos e não nulos; identificadores de livros não podem estar vazios. Espaços externos e repetições são removidos, e os IDs são ordenados para processamento consistente.

### POST /bookshelves/books/membership-summary

Retorna `200` com `BookshelfBulkSummaryDTO`:

```json
{
  "booksCount": 2,
  "shelves": [
    { "bookshelfId": 1, "existingCount": 1 },
    { "bookshelfId": 2, "existingCount": 0 }
  ]
}
```

Operação read-only: verifica propriedade de todos os destinos e faz uma consulta agrupada no repositório de itens. Não consulta Google Books, não cria catálogo e não inclui livros na biblioteca. Livros ausentes do catálogo contam como ausentes nos destinos. O frontend consulta a página de estantes exibida; destinos recém-criados têm zero vínculos. Após resultado incerto, destinos selecionados adicionais são consultados em blocos de até 20.

### POST /bookshelves/books/batch

Retorna `200` com `BookshelfBulkResultDTO`, inclusive se todos os vínculos já existirem:

```json
{
  "booksCount": 2,
  "shelves": [
    { "bookshelfId": 1, "addedCount": 1, "alreadyPresentCount": 1 },
    { "bookshelfId": 2, "addedCount": 2, "alreadyPresentCount": 0 }
  ]
}
```

Cada resultado representa uma estante. Totais somados são adições livro–estante, não livros únicos: dois livros em duas estantes podem produzir quatro adições.

## Serviços, consultas e transações

`BookshelfBulkService` coordena o novo fluxo. Os endpoints individuais e `/bookshelves/book/batch` continuam disponíveis; o lote antigo adiciona **um livro a várias estantes**, enquanto o novo recebe vários livros.

1. Validar os destinos usando `BookshelfService.getOwnedBookshelves` antes de qualquer preparação externa.
2. Buscar livros locais em conjunto com `BookRepository.findByGoogleBooksIdIn`.
3. Preparar somente os livros ausentes pelo `GoogleBooksService` existente, aproveitando o cache. No máximo quatro consultas simultâneas por operação, com orçamento total de 45 segundos; tarefas restantes são canceladas em caso de falha/interrupção. Nenhuma escrita acontece nessa fase.
4. Iniciar uma transação nova com timeout configurado de 15 segundos, revalidar destinos e reler o catálogo.
5. Persistir dados externos preparados pelo método interno `BookService.createFromPreparedGoogleBook`, reutilizando os mapeamentos e resolução de autores/categorias existentes, sem chamadas externas dentro da transação.
6. Garantir a relação pessoal com `UserBookService.ensureInLibrary`: relações existentes mantêm status, favorito, progresso e datas; novas começam em Quero ler, sem favorito.
7. Consultar os vínculos existentes de todas as combinações em conjunto, inserir somente os faltantes com saveAll/flush e calcular o resultado da tentativa concluída.

Uma falha de escrita desfaz a transação inteira, incluindo novos livros, autores, categorias, relações pessoais e itens de estante. Um conflito de unicidade SQLSTATE 23505 ou uma falha concorrente de transação permite **uma** nova tentativa em transação nova, relendo o estado; os demais erros não são repetidos. A preparação externa não é repetida por esse mecanismo. A resposta só é entregue depois do commit.

As consultas novas de `BookshelfItemRepository` são `countSelectedBooks` (projeção agrupada) e `findSelectedItems` (vínculos do lote). Não há consulta de existência por combinação livro–estante. saveAll utiliza o mecanismo de persistência existente, sem prometer um único INSERT SQL.

Erros usam o tratamento existente: 400 validação, 403 destino alheio, 404 recurso ausente, 409 conflito persistente e 502 indisponibilidade externa. O frontend configura 90 segundos apenas para o novo POST de escrita, preservando o timeout global das demais chamadas.

Não há migração nem dependências novas. São reutilizadas as tabelas books, user_book, bookshelf_item e as tabelas de autores/categorias, com suas restrições atuais de unicidade. Os contratos anteriores não foram alterados.

## Testes reproduzíveis

### Backend

Na pasta backend, com Java 21:

```powershell
.\mvnw.cmd "-Dtest=Bookshelf*Tests" test
```

Os testes PostgreSQL são opt-in. Provisionar um cluster local **isolado**, usuário `codex_bulk`, banco `letterbooks_bulk_test`; a suíte cria/remove o esquema e limpa tabelas desse banco. Não usar o banco da aplicação. A URL é validada para aceitar somente esse nome em 127.0.0.1.

```powershell
.\mvnw.cmd "-Dtest=Bookshelf*Tests" "-Dbulk.test.url=jdbc:postgresql://127.0.0.1:55439/letterbooks_bulk_test" test
```

Classes novas: `BookshelfBulkControllerTests`, `services.BookshelfBulkTests` e `BookshelfBulkPostgresTests`. Cobrem contratos HTTP, validação, autorização, contagens sem escrita, normalização, limite de concorrência externa, falha externa, rollback, política de repetição, criação de catálogo, preservação de status/favorito/progresso, revalidação de destino removido e concorrência com catálogo local e novo.

### Frontend

```powershell
npm run build
npm run lint
node scripts/verify-bulk-selection.cjs
```

O script de navegador requer um servidor Vite em 127.0.0.1:5175 e Playwright disponível externamente. Não adiciona pacotes ao projeto. Quando necessário, definir `PLAYWRIGHT_MODULE` com o caminho do pacote existente e `PLAYWRIGHT_CHROMIUM_EXECUTABLE` com um Chromium/Chrome instalado. `BULK_UI_URL` permite mudar o endereço e `BULK_UI_OUTPUT` permite mudar a pasta de artefatos, cujo padrão é backend/target/bulk-ui.

Todas as requisições fetch/XHR são interceptadas: o script não grava no backend real. Exercita seleção individual/todos, teclado, descarte e histórico, descoberta por seção, visualização detalhada, criação inline, contagens, limites, erros/nova tentativa, resultado incerto, bloqueio durante envio, Favoritos, detalhe de estante, fluxos individuais, URLs legadas, visitante e logout. Captura telas em 320, 390, 768 e 1280px e verifica ausência de overflow horizontal.

## Limites da validação

Em 29/10/2026, passaram build e lint do frontend, os onze cenários do script de navegador e os 33 testes de estantes do backend, incluindo oito execuções em PostgreSQL 18 isolado. A concorrência exercitou conflitos reais de unicidade de relações pessoais e de nomes de autores, recuperados pela nova tentativa. O build mantém o aviso de bundle JavaScript acima de 500 kB.

Os testes usam respostas Google Books simuladas e não consomem sua API real. Os testes de navegador usam API simulada; os testes de transação e concorrência usam PostgreSQL real isolado. Não foi executada uma jornada de navegador contra o banco de desenvolvimento. Falhas de rede podem impedir confirmar o resultado de uma requisição já salva; a consulta de contagens e a repetição sem duplicar vínculos tratam esse caso, sem prometer cancelamento remoto ao fechar a aba.
