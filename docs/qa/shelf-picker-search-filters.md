# Estantes múltiplas e filtros da pesquisa — 21/10/2026

## Interface

- `ActiveSearchFilters` apresenta badges dos filtros avançados aplicados: título, autor, editora, assunto e ISBN. A origem é a pesquisa da URL, preservando recarga, navegação e paginação. A busca livre continua no campo principal; não mistura os filtros com seu texto.
- `ShelfPickerDialog` é a apresentação compartilhada pelo fluxo real e pelo Style Guide. Usa Scroll Area, Checkbox e os tokens existentes, sem novas dependências. Somente a lista rola: título, identificação do livro, criação de estante, link, paginação e ações ficam fora da região rolável.
- Criar estante é uma ação compacta acima da lista; Ver minhas estantes fica abaixo da lista e antes das ações.
- O estado de seleção é um Set e permanece ao mudar a página e ao criar uma estante. Estantes que já contêm o livro aparecem marcadas e desabilitadas, sem permitir remoção neste fluxo de inclusão.
- O exemplo do `/styleguide#library` usa 30 estantes fictícias e permite criar e salvar seleções localmente, sem chamadas à API. O link de navegação é interceptado apenas no exemplo.

## Backend

Novo endpoint autenticado: `POST /bookshelves/book/batch`.

```json
{"googleBooksId":"id-google","bookshelfIds":[1,2,3]}
```

O controller valida a entrada e delega ao serviço transacional. Todas as estantes são carregadas em lote e sua propriedade é validada antes de resolver/persistir o livro. O livro é resolvido uma vez; a relação com a biblioteca é garantida uma vez; vínculos já existentes são consultados em lote e ignorados. IDs repetidos são deduplicados. As associações novas são salvas na mesma transação, com rollback em falha.

O endpoint individual e seu comportamento anterior foram mantidos. Nenhuma tabela, coluna, regra de autenticação ou avaliação foi alterada. Livros continuam sendo persistidos apenas em interações que exigem armazenamento.

A instância do backend já em execução precisa carregar as novas classes/endpoints por reinicialização. Não foi realizada inclusão em lote nos dados reais da conta durante os testes de navegador.

## Arquivos principais

- Frontend: `AddToShelfDialog.tsx`, `ShelfPickerDialog.tsx`, `ActiveSearchFilters.tsx`, `ui/scroll-area.tsx`, `ui/checkbox.tsx`, `ui/badge.tsx`, `bookshelfService.ts`, `ExplorePage.tsx`, `StyleGuidePage.tsx`, `styleguide/ShelfPickerExample.tsx`, `styles/domain-components.css`.
- Confirmações de inclusão: `ExploreBookCard.tsx`, `MyBooksPage.tsx` e `ShelfManager.tsx`.
- Backend: `BookshelfBatchItemRequestDTO.java`, `BookshelfController.java`, `BookshelfService.java`, `BookshelfItemService.java`, `BookshelfItemRepository.java` e `BookshelfBatchItemTests.java`.

## Validação

- 15 testes direcionados passaram: BookshelfBatchItemTests, BookshelfLibraryTests, BookshelfMembershipTests e BookshelfQueryTests. Cobrem duplicatas, vínculos existentes, permissão, estante ausente, validação da entrada, resolução única do livro, rollback por proxy transacional e compilação JPQL pelo Hibernate com dialeto PostgreSQL, sem conexão ao banco.
- Navegador: badges conferidos na URL de pesquisa fornecida pelo usuário; seleção de três opções e criação de uma quarta opção preservando a seleção; rolagem da lista até o último item com scrollTop do diálogo em zero; ações visíveis em 320, 390, 768, 1024 e 1440 px (altura de 568 px).
- Build, lint e ambos os scripts de isolamento do Style Guide passaram. Permanece o aviso já conhecido de bundle acima de 500 kB; não houve otimização de bundle fora do escopo.

A lista real da conta também foi conferida sem gravar: oito checkboxes, nenhum radio, estantes existentes marcadas/desabilitadas, lista com overflow e diálogo sem overflow.
