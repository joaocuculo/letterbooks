# Detalhes do livro — Biblioteca

Extensão aprovada da identidade do LetterBooks, consolidada em 2026-10-10. A rota pública `/books/:googleBooksId` usa SiteHeader e apresenta identificação, capa, sinopse sanitizada com DOMPurify, informações da edição, avaliação pessoal e avaliações dos leitores. Biblioteca substitui a comparação entre Apresentação, Biblioteca e Editorial. A identidade neutra compacta foi preservada.

## Composição e capa

Biblioteca organiza capa e ações em lateral de 240px, com identificação, sinopse, edição e opiniões à direita. A lateral só fica sticky se sua altura mais 48px couber na viewport. Abaixo de 1024px, a ordem é identificação, capa, ações, sinopse, edição e avaliações. O conteúdo chega a 1120px com padding de 32px 40px 72px; abaixo de 1024px, chega a 720px com padding de 24px 28px 56px; abaixo de 480px, usa 20px 20px 48px. A página rola naturalmente, sem painel interno de rolagem.

Manrope e corpo de 14px acompanham a escala compacta. Títulos usam 28–36px e seções 19px; sinopse tem entrelinha 1.85 e medida máxima de 70ch. Campos e ações mantêm pelo menos 44px de altura; campos usam 16px abaixo de 1024px, incluindo a opção de nota zero. Capa inteira com `object-fit: contain`, cantos de 5px e sombra discreta; ausência ou falha exibe “Capa indisponível”. Dados da edição ausentes exibem “Não informado.”; sinopse e autoria também têm contingências textuais.

Clicar na capa abre um lightbox com fundo escuro, imagem inteira e botão de fechar. Escape ou clique fora também fecham; o foco retorna ao controle da capa. O diálogo usa o componente Base UI existente. A imagem ampliada usa a mesma fonte: não há aprimoramento de qualidade ou resolução além da imagem fornecida.

## Relação pessoal e estantes

Favoritar e status usam os serviços existentes. Sem relação prévia, a gravação faz `POST /user-books`; com relação, `PATCH /user-books/:id`. Status disponíveis: Quero ler, Lendo, Lido e Abandonado. Remover a relação usa confirmação nativa e `DELETE /user-books/:id`. Visitantes são encaminhados ao login ao interagir, com `state.from` contendo caminho, query e fragmento da origem.

Abaixo das informações da edição, o cartão “Na sua biblioteca” mostra status e Favoritos em “Agrupamentos de leitura”, além dos nomes das estantes personalizadas que realmente contêm o livro. Os nomes não são links. O cartão fica oculto quando não há status, favorito ou estante associada. Esta consulta não implementa gerenciamento de estantes.

A nova leitura autenticada `GET /bookshelves/book/google/{googleBooksId}/me` devolve somente `id` e `name` das estantes do usuário proprietário. A projeção consulta associações existentes pelo Google Books ID, sem persistir o livro e sem devolver estantes de outras pessoas. Usa query de projeção no backend, sem novas dependências ou migrações. Carregamento, falha e nova tentativa de estantes são independentes da operação pessoal e das avaliações públicas.

## Avaliação e exclusão

Avaliar/Editar abre formulário inline e leva foco à nota selecionada; uma avaliação com zero foca “Sem estrelas”. A nota é obrigatória e aceita inteiros de 0 a 5. As cinco estrelas oferecem prévia no hover e usam radios nativos para seleção por teclado. “Sem estrelas” é uma opção explícita para zero; não selecionar nota continua diferente de selecionar zero. Comentário é opcional e enviado com espaços externos removidos.

Criar usa `POST /ratings` com `googleBooksId`, nota e comentário; editar usa `PATCH /ratings/:id`. Sucesso atualiza a avaliação pessoal e a lista pública em memória, recolhe o formulário, anuncia sucesso e devolve foco à região de avaliação. Cancelar descarta o rascunho e devolve foco. Falha de envio mantém formulário e rascunho para nova tentativa. Durante o envio, campos e ações ficam desabilitados e usam `aria-busy`.

As avaliações aparecem em cartões cinza arredondados com nota em estrelas. Somente a própria avaliação mostra menu de reticências, com “Editar avaliação” e “Excluir avaliação”. Excluir usa vermelho e abre diálogo de confirmação; Cancelar conserva a avaliação. Confirmar usa o endpoint existente `DELETE /ratings/{id}`, atualiza avaliação pessoal/lista pública e preserva a relação do livro com a biblioteca. Falha mantém o diálogo aberto com erro e nova tentativa; durante a exclusão as ações ficam desabilitadas. O diálogo devolve foco à região de avaliação.

## Carregamento, falha e acesso

Livro e avaliações públicas carregam independentemente por `GET /books/:googleBooksId` e `GET /ratings/book/google/:googleBooksId`. Dados pessoais autenticados usam `GET /user-books/book/:googleBooksId` e `GET /ratings/book/google/:googleBooksId/me`, reunidos na mesma operação pessoal. Estantes têm consulta independente. Falha pública nas avaliações preserva o livro; retry solicita apenas avaliações. Retry pessoal repete as duas consultas pessoais; retry de estantes repete apenas estantes. Falha no livro oferece nova tentativa localizada.

Carregamentos e sucesso usam `role="status"`; erros usam `role="alert"`. Nota inválida usa `aria-invalid` e mensagem associada por `aria-describedby`; favorito expõe `aria-pressed`. Foco visível acompanha a identidade compartilhada. A lista pública mostra a página devolvida pelo serviço atual; não foram acrescentadas média ou paginação de avaliações.

## Evidências e limites

Revisão final de escopo: `ship`, após correção de dois achados — foco inicial na nota zero e dimensões indevidas herdadas pelo radio da nota zero. Os achados dessa revisão foram resolvidos. As verificações de interação usaram respostas simuladas, sem contas ou alterações reais de produção:

- Criação com zero, edição, exclusão confirmada e cancelamento da exclusão.
- Prévia das estrelas e seleção de nota; retorno do foco ao fechar o formulário.
- Lightbox em desktop/celular, Escape/clique fora e retorno do foco.
- Cartão com agrupamentos e estantes personalizadas reais da fixture, sem links.
- Reflow em 320px sem overflow horizontal.

Build e lint finais do frontend passaram. A execução direcionada do backend terminou com BUILD SUCCESS: dois testes em `BookshelfMembershipTests` e cinco em `BookSpecificationsTests`, total de sete sem falhas ou erros. Os testes isolados de proprietário verificam principal autenticado, chamada exata de leitura ao repositório e resultado vazio para livro não persistido usando proxy JDK de repositório. Não foram realizadas mutações reais de API ou testes com dados de produção.

Capturas com fixture ilustrativa de Duna:

| Estado | Desktop | Mobile |
| --- | --- | --- |
| Biblioteca consolidada | [Captura](../.impeccable/review/book-library-refined-desktop.png) | [Captura](../.impeccable/review/book-library-refined-mobile.png) |
| Capa ampliada | [Captura](../.impeccable/review/book-cover-lightbox.png) | [Captura](../.impeccable/review/book-cover-lightbox-mobile.png) |
| Formulário de estrelas | [Captura](../.impeccable/review/book-rating-stars.png) | [Captura](../.impeccable/review/book-rating-stars-mobile.png) |

Frontend: `frontend/src/pages/BookDetailsPage.tsx`, `frontend/src/styles/book-details.css`, componentes `BookCover`, `StarRating`, `BookRelationshipControls`, `RatingForm` e `RatingsList`. Backend: projeção de associação de Bookshelf por proprietário e Google Books ID, com cobertura em `BookshelfMembershipTests` e `BookSpecificationsTests`. Contrato e conclusão: `.impeccable/book-details-brief.md`.

O frontmatter e o sidecar anteriores ainda registram escalas antigas (por exemplo corpo 15px e título de login 44px), enquanto esta extensão acompanha o corpo 14px já aprovado. Esse drift preexistente foi preservado. Não houve mudança de tokens normativos nem regeneração de `.impeccable/design.json`; esta documentação não autoriza reparos do sistema inteiro ou de outras superfícies.

O botão de fechar a capa ampliada fica fixo no canto superior direito da tela, com afastamento de 16px e respeito à área segura do dispositivo.
