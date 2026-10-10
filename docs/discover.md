# Descoberta e alternativa local

## Diagnóstico — 9 de outubro de 2026

As chamadas foram feitas diretamente ao Google Books com a configuração de desenvolvimento, sem registrar a chave. Os resultados são evidência desse teste, não garantia de comportamento futuro da API.

| Consulta | HTTP | totalItems | Livros retornados |
| --- | --- | --- | --- |
| subject:fiction | 200 | 0 | 0 |
| subject:technology | 200 | 0 | 0 |
| subject:biographies | 200 | 0 | 0 |
| subject:biography | 200 | 0 | 0 |
| intitle:dune | 200 | 0 | 0 |
| fiction | 200 | 106 | 10 |
| technology | 200 | 82 | 10 |
| biographies | 200 | 69 | 10 |
| duna | 200 | 335 | 10 |
| harry potter | 200 | 342 | 10 |

O teste de subject:fiction e intitle:dune com dois-pontos sem codificação também retornou zero. Não houve timeout ou erro HTTP nessas chamadas. A documentação confirma subject como filtro de categorias e maxResults=10/startIndex=0/printType=books como parâmetros válidos. Não foi identificada a causa interna do comportamento do Google; não há evidência para atribuí-lo a quota ou sintaxe inválida.

Fontes: [Guia de pesquisa](https://developers.google.com/books/docs/v1/using?hl=pt-br#PerformingSearch), [Referência volumes.list](https://developers.google.com/books/docs/v1/reference/volumes/list).

## Implementação

- DiscoverService mantém três seções e doze livros por seção; usa fiction, technology e biographies em texto livre. São buscas temáticas amplas, não filtros estritos de categoria. Continua usando o mesmo cliente e timeout total de cinco segundos por consulta.
- Falha, resposta vazia ou ausência de dados essenciais acionam a consulta local da seção. Itens inválidos isolados não eliminam os válidos da mesma resposta.
- BookSpecifications.withSubjects busca nomes principais e alternativos das categorias, com OR entre os termos em português/inglês e distinct para evitar livros repetidos pelos joins. Mantém os caminhos categories/categoryNames do modelo atual.
- O banco retorna até doze livros, ordenados por createdAt e id decrescentes (mais recentemente persistidos, não necessariamente publicados).
- Se todas as seções ficarem vazias, uma consulta geral retorna “Do nosso catálogo”. Livros sem categoria correspondente não são colocados artificialmente em Ficção/Tecnologia/Biografias.
- Favoritos e userBookId são resolvidos para o usuário autenticado; visitantes recebem os mesmos livros sem informações pessoais. Não são expostos usuários, avaliações privadas ou dados de terceiros.
- O serviço usa transação somente de leitura, não cria livros e não salva alterações. A regra de persistência apenas após interação permanece.
- GoogleBooksService deixa de guardar respostas sem items no cache de pesquisa. Resultados com livros continuam com o cache existente; isso também vale para /search. Não houve alteração na regra de fallback do /search, que continua distinguindo falha de resposta vazia.
- Os logs indicam seção, consulta fixa, quantidade e origem (Google ou banco), distinguindo indisponibilidade de ausência de resultados, sem registrar a chave.

## Compatibilidade e validação

GET /books/discover conserva o corpo sections/key/title/books. O frontend atual renderiza a seção catalog sem mudança de tipos. Se Google e banco não tiverem livros, sections permanece vazio. Não foram unificadas as páginas visuais de Explorar/Pesquisar nesta etapa.

Testes cobrem resposta normal, falha, vazio, exceção, itens incompletos, mistura Google/banco, favoritos, visitantes, catálogo sem categorias, banco vazio, ordenação/limite, cache com proxy Spring e caminhos reais das entidades na Specification. As consultas de mapeamento são validadas sem conexão a PostgreSQL; os testes de serviço usam repositórios simulados, sem modificar dados reais.

Validação concluída: 20 testes passaram (DiscoverServiceTests, GoogleBooksSearchTests, GoogleBooksCacheTests e BookSpecificationsTests), com compilação do backend aprovada.
