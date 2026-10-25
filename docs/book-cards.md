# Cards de livros

Explorar, Minha Biblioteca e livros de uma estante usam `BookCardFrame`, mantendo os controladores de dados e ações em seus componentes originais. Cards de coleção de estantes e exemplos da Home permanecem independentes.

## Aparência e composição

- Referência visual atual: capa até as bordas superiores, fundo branco, borda cinza de 1 px (`#e5e5e5`), raio de 16 px e sombra discreta. Padding de 16 px apenas nas informações.
- Capa com proporção 2:3, `object-fit: contain`, carregamento lazy e alternativa textual para ausência ou falha. A fonte que falhou é lembrada, permitindo tentar uma nova URL se o livro for atualizado.
- Título completo no link e no DOM, limitado visualmente a duas linhas com altura reservada. Tooltip apresenta o texto completo por hover ou foco do teclado. Autoria também usa duas linhas no Explorar.
- Controles nos cantos superiores da capa: coração circular no canto superior esquerdo e menu outline no canto superior direito, ambos apenas com ícone e áreas de toque de 44 px. Nome acessível e estado `aria-pressed` preservados. Os botões ficam fora do link da capa. Menu branco com borda fina, raio de 12 px, separadores, ícones e ação destrutiva vermelha, conforme a referência shadcn/ui Button Group (https://ui.shadcn.com/docs/components/base/button-group).
- Explorar detalhado mantém capa à esquerda e metadados identificados à direita; abaixo de 480 px passa a vertical. As grades das páginas mantêm seus pontos de quebra anteriores.
- Salvamento bloqueia ambos os controles do livro e informa `aria-busy`. Feedback fica abaixo das informações. Falhas preservam o estado anterior.

## shadcn/ui

Componentes locais adaptados do registro oficial **Base Nova**: Card, Button, Dropdown Menu e Tooltip. Fontes: `https://ui.shadcn.com/r/styles/base-nova/{card,button,dropdown-menu,tooltip}.json`.

Os componentes usam Base UI já instalado, `class-variance-authority`, `clsx` e `tailwind-merge`. `components.json` registra o estilo e os aliases; `@/` resolve para `src/` em TypeScript e Vite. O menu contém apenas os wrappers necessários. Os estilos de tema usam variáveis `--ui-*` em `.shadcn-surface`, inclusive nos portais, sem substituir o tema global ou redefinir os controles antigos.

## Verificação

Build e lint do frontend. Revisão de navegador com fixtures locais e adaptador Axios simulado, sem alterar contas ou dados reais:

- Explorar compacto/detalhado e Biblioteca, incluindo conteúdo de estante sem relação pessoal; larguras de 320, 390, 768 e 1440 px sem overflow horizontal nas verificações realizadas.
- Títulos longos/com palavras sem espaços, autoria extensa/ausente, metadados ausentes e capas ausentes/quebradas; títulos com altura de 42 px e ações alinhadas entre cards da mesma linha.
- Tooltip por foco no link; menu por clique e teclado, Escape e retorno de foco ao acionador.
- Visitante enviado ao login pela ação de estante; favoritos e alteração de status autenticados; inclusão em estante; confirmação de remoção; retirada da estante usando somente o endpoint da estante.
- Salvamento simulado com `aria-busy`, ações desabilitadas e mensagem; falha localizada sem alterar favorito anterior.

As fixtures e capturas de revisão ficam em `.impeccable/review/` (ignoradas pelo Git); não fazem parte do build. Essa validação cobre a interface e os contratos enviados, não comprova integração ao vivo com Google Books ou persistência em uma conta real. Build mantém o aviso de bundle acima de 500 kB já existente no projeto.

## Revisão pela referência visual

A solicitação posterior substituiu o rodapé horizontal pelos controles verticais sobre a capa e autorizou a aparência com sombra discreta da imagem de referência. Favorito e menu usam somente ícones em todas as larguras. Build/lint e reflow da Biblioteca e do Explorar detalhado em 320, 390, 768 e 1440 px foram conferidos novamente; favorito simulado continuou funcionando e controles mediram 44 × 44 px. Capturas: book-cards-reference-desktop.jpg e book-cards-reference-mobile.jpg em .impeccable/review/.

## Densidade do Explorar

O Explorar agora opta pela escala reutilizável catalog-density. O componente compartilhado lê variáveis de dimensões, padding, controles e tipografia; seus valores anteriores permanecem como padrão nas demais páginas. Em 1440 px, a grade mostra seis cards de aproximadamente 190 px, e o detalhado mostra três cards com capa de 120 px. Desktop com ponteiro preciso usa controles de 36 px; mobile e pointer: coarse preservam 44 px. Detalhes e validação em docs/explore.md.

## Reformulação do BookCard — outubro de 2026

O frame compartilhado agora usa raio de 18 px, padding de 13 px, capa 2:3 com object-fit: cover e autoria em uma linha. Os controles simétricos têm 38 px, inset de 12 px, fundo translúcido com blur e formato circular. Favoritos usam o laranja da identidade. O container recorta o conteúdo; o menu continua em portal Base UI, com posicionamento adaptativo e estilos exclusivos dos cards. A tipografia do card e menu usa Inter. Movimento reduzido desativa as transições adicionadas.

Os contratos atuais não fornecem avaliação; nenhuma nota foi criada. O modo detalhado mantém sua composição horizontal e os metadados existentes.

## Média pública de avaliações e agrupamento compacto

Esta revisão substitui a ausência de avaliações descrita acima. Pesquisa (externa e fallback local) e discover retornam averageRating: number | null no BookCardResponseDTO. Não houve alterações em entidades, schema, autenticação, paginação ou na persistência sob demanda. A Home atual é uma apresentação estática; suas ilustrações não consomem esse DTO. Cards da biblioteca usam outro contrato e não recebem uma média artificial.

RatingRepository usa JPQL com AVG(score), IN e GROUP BY por book.googleBooksId e projection BookRatingAverage. RatingSummaryService deduplica IDs e evita consultar listas vazias. O próprio join com Rating identifica os livros locais avaliados, sem consulta prévia ou criação de Book. A pesquisa faz uma consulta de médias por página; discover agrega todos os IDs de todas as seções numa consulta. A consulta inclui todos os usuários, inclusive para visitantes. Nenhum valor médio é persistido ou arredondado no backend. O cache existente do Google Books continua apenas com os dados externos; médias são consultadas novamente a cada chamada do catálogo.

BookCard agora reutiliza ExploreBookCard, mantendo suas props públicas. BookRating usa Intl.NumberFormat('pt-BR') com uma casa decimal e estrela Lucide. Null apresenta estrela vazia e Sem avaliações. Uma média real igual a zero continua válida (Rating admite scores de 0 a 5).

O título não reserva mais uma segunda linha vazia: o autor começa 5 px após o texto efetivo. A área de conteúdo reserva no mínimo 118 px para manter alturas consistentes, deixando eventual sobra depois das informações. Avaliação começa 8 px após o autor. Capas preservam proporção 2:3 do espaço e usam contain para mostrar a imagem integral, com superfície neutra nas áreas restantes. Controles circulares continuam em 38 px, com feedback ativo e foco.

Arquivos desta revisão: RatingRepository, repositories/projections/BookRatingAverage, services/RatingSummaryService, BookService, DiscoverService, BookMapper, BookCardResponseDTO; frontend types/book.ts, BookCard, ExploreBookCard, BookCardFrame, styles/book-card.css. Testes: BookCardRatingTests, RatingAveragePostgresTests e atualização dos construtores em DiscoverServiceTests/GoogleBooksSearchTests.

Validação: build e lint do frontend; suíte existente do backend; testes de pesquisa paginada, fallback local, discover com três seções/IDs repetidos, visitante e usuário autenticado; contrato JSON com null e precisão preservada. Integração executada em PostgreSQL 18 isolado (ratings.test.url): livros ausentes/sem avaliações, uma e várias avaliações, score zero, edições, exclusões e estatísticas Hibernate (uma consulta, nenhuma entidade carregada).

Revisão visual com fixture temporária usando os componentes reais: títulos de uma/duas linhas, autor longo, capas 2:3/quadrada/panorâmica, imagem ausente/inválida, notas nulas/zero/decimais; botões 38 px e gap de 5 px medidos no DOM. Favorito, menu em portal, Escape/retorno de foco e seleção por teclado conferidos. Sem overflow horizontal em 390 e 320 px. Fixture removida após a revisão; essas interações não alteraram contas reais.

## Paleta neutra restaurada

Os destaques laranja adicionados ao card foram removidos. Favorito ativo, estrela da média e contornos de foco usam agora o token existente --ui-foreground, seguindo a paleta neutra atual do site. O preenchimento dos ícones continua distinguindo os estados.
