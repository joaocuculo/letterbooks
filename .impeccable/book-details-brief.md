# Detalhes do livro — Biblioteca consolidada

Modo Operate/Read. Extensão aprovada em 2026-10-10, mantendo branco, preto, cinza, Manrope compacta e capa como cor. Biblioteca é a composição escolhida para `/books/:googleBooksId`; a comparação entre Apresentação, Biblioteca e Editorial foi encerrada.

Biblioteca usa lateral de 240px com capa/ações e conteúdo à direita; sticky somente quando cabe na altura. Abaixo de 1024px segue uma coluna na ordem identificação, capa, ações, sinopse, edição e avaliações. Corpo 14px, títulos 28–36px, controles >=44px, campos 16px em telas menores. Sem rolagem interna.

## Contrato aprovado

- Avaliações em cartões cinza arredondados; somente a própria avaliação tem menu de reticências com Editar/Excluir. Exclusão vermelha, diálogo de confirmação e endpoint existente `DELETE /ratings/{id}`; preserva o livro na biblioteca.
- Avaliar/editar abre inline; cancelar descarta, salvar recolhe e atualiza a avaliação. Estrelas 0–5 com hover, radios nativos por teclado e opção explícita “Sem estrelas”. Zero é válido e recebe foco inicial ao editar nota zero. Comentário opcional; falha conserva rascunho.
- Capa abre lightbox escuro com a imagem inteira; Escape/clique fora/botão fecham e devolvem foco. Mesma imagem fornecida, sem melhoria de qualidade além da fonte.
- “Na sua biblioteca” abaixo da edição mostra status/favorito e estantes personalizadas que contêm o livro, sem links. Oculto sem associações. Consulta autenticada `GET /bookshelves/book/google/{googleBooksId}/me`, somente id/nome do proprietário, sem persistência de livro e com retry independente.
- Preservar login com retorno, favorito, quatro status e remoção confirmada da relação. Livro, avaliações, operação pessoal e estantes têm retry localizado. HTML sanitizado com DOMPurify. Sem médias, nova paginação, dependências ou migrações.

Frontend: `frontend/src/pages/BookDetailsPage.tsx`, `frontend/src/styles/book-details.css`, componentes `BookCover`, `StarRating`, `BookRelationshipControls`, `RatingForm` e `RatingsList`. Backend usa projeção de associações de Bookshelf filtrada por proprietário e Google Books ID; testes de proprietário em `BookshelfMembershipTests` e de mapeamento em `BookSpecificationsTests`.

## Conclusão — 2026-10-10

Revisão final de escopo com disposition `ship`, após resolver os dois achados: autofocus na opção zero e fonte de 16px do radio em telas menores. Nenhum achado dessa revisão ficou pendente. Mocks verificaram salvar zero, editar, excluir, cancelar exclusão, estrelas, lightbox com retorno de foco e reflow em 320px sem overflow horizontal; sem contas reais ou alterações em produção.

Build e lint finais passaram. Backend direcionado: BUILD SUCCESS, dois testes de proprietário em `BookshelfMembershipTests` e cinco de mapeamento em `BookSpecificationsTests`, sete testes sem falhas ou erros. Os testes isolados de proprietário usam proxy JDK do repositório para verificar principal autenticado, chamada exata de leitura e resultado vazio para livro não persistido. Sem mutações reais de API ou dados de produção. Capturas ilustrativas de Duna: `.impeccable/review/book-library-refined-desktop.png`, `book-library-refined-mobile.png`, `book-cover-lightbox.png`, `book-cover-lightbox-mobile.png`, `book-rating-stars.png` e `book-rating-stars-mobile.png`.

Documentação final em `docs/book-details.md`, extensão visual em `DESIGN.md` e capacidade em `PRODUCT.md`. O frontmatter e `.impeccable/design.json` foram preservados: não houve mudança real de tokens. Drift anterior de escalas e documentos de outras superfícies ficam fora deste escopo.


