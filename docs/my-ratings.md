# Minhas avaliações

Rota privada `/my-ratings`, acessível no menu da conta. Lista as avaliações existentes do usuário; não mantém versões anteriores nem avaliações excluídas.

## Contrato e consultas

`GET /ratings/user?q=termo&page=0&size=20&sort=createdAt,desc` preserva o DTO e o envelope de paginação existentes. `q` é opcional, compara parte do título sem diferenciar caixa e trata `%`, `_` e `!` literalmente. A comparação Unicode segue a configuração de locale do PostgreSQL.

O usuário vem exclusivamente do principal autenticado. JPQL filtra antes da paginação; `EntityGraph` carrega livro e usuário. Ordenação padrão por criação decrescente, desempate por id decrescente; ordenar por nota acrescenta criação decrescente antes do id. A integração mede duas consultas numa página completa (dados e contagem), incluindo a execução do mapper. Nenhuma chamada ao Google Books ou persistência ocorre nessa leitura.

## Interface

- URL mantém `q`, `order` (`recent`, `oldest`, `highest`, `lowest`) e `page` (base zero); filtros retornam à página inicial.
- Capas e títulos abrem o livro preservando a origem. Menus enviam `ratingAction` e `ratingId` no estado do Router.
- Detalhes aguardam a avaliação autenticada, consomem a intenção por substituição do estado da navegação e abrem edição ou confirmação. Nenhuma mutação ocorre ao navegar.
- Retorno ao histórico recarrega os dados. Página fora do intervalo é substituída pela última válida.
- Comentário tem quatro linhas inicialmente; expansão é local. Sem comentário, não é criado texto substituto.
- Style Guide usa o componente real, com dados locais e navegação interceptada.

## Arquivos desta entrega

Frontend: `MyRatingsPage.tsx`, `RatingHistoryItem.tsx`, `my-ratings.css`, `ratingService.ts`, `AccountMenu.tsx`, `App.tsx`, `AppLayout.tsx`, `BookDetailsPage.tsx`, `StyleGuidePage.tsx` e `styleguide/DomainExamples.tsx`.

Backend: `RatingController.java`, `RatingService.java`, `RatingRepository.java`, `RatingHistoryTests.java`, `RatingHistoryControllerTests.java` e `RatingHistoryPostgresTests.java`.

## Verificação

- Frontend: `npm run build`, `npm run lint`, `npm run check:styleguide-production`, `npm run check:styleguide-isolation`.
- Backend: `./mvnw.cmd '-Dtest=RatingHistoryTests,RatingHistoryControllerTests,SessionSecurityTests' test`.
- Integração: `RatingHistoryPostgresTests` usa a configuração descartável de `RatingAveragePostgresTests`, habilitada somente com `ratings.test.url` apontando ao banco local **letterbooks_ratings_test**, usuário **codex_test**. A configuração cria/remove tabelas; nunca usar no banco da aplicação. Usar locale Unicode (por exemplo ICU `und`) para testar maiúsculas acentuadas.
- Navegador: histórico real somente leitura; busca com Enter, retorno com parâmetros, edição automática, cancelamento, não repetição após reload, abertura da confirmação de exclusão sem confirmar e viewport de 375 px sem rolagem horizontal. Expandir/recolher comentário testado no laboratório.

Reiniciar o backend para disponibilizar o parâmetro `q` na instância de desenvolvimento já em execução. Sem migrações e sem novas dependências. O aviso anterior de tamanho do bundle permanece.
