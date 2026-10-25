# Explorar

`/explore` reúne descoberta pública e pesquisa submetida. `SearchPage` redireciona `/search` para a rota canônica com `replace`, preservando query e hash. SiteHeader oferece um único link Explorar, compartilhado pela Home e pelo Perfil.

## Estado e pesquisa

Sem termo ou filtros aplicados, a página consulta `GET /books/discover` e renderiza grades completas de até doze livros por seção. Com algum valor aplicado, consulta `GET /books/search`. O serviço frontend envia `size=20`; BookController também usa vinte como tamanho padrão. A URL contém `q`, `title`, `author`, `publisher`, `subject`, `isbn` e `page`. `q` corresponde a `freeText` na API. Página é baseada em zero; ausente ou inválida equivale a zero e a interface mostra números a partir de um.

Termo e filtros possuem rascunho local e são aplicados por Pesquisar, Aplicar filtros ou Enter. Não há consulta a cada tecla. Novo envio reinicia a página; reenviar a pesquisa aplicada dispara nova tentativa. Limpar filtros conserva o termo já aplicado, e Limpar pesquisa remove parâmetros e retorna à descoberta. Mudanças de URL restauram os campos. Cada nova consulta cancela a anterior por AbortController.

## Apresentação e ações

A descoberta alinha introdução e busca lado a lado no desktop; abaixo de 1024 px, empilha esses blocos. Na pesquisa, a busca ocupa o topo e os resultados usam toda a largura disponível. Compacto é o padrão: a grade automática acomoda seis colunas em 1280–1440 px, cinco em 1024 px, quatro em 768 px e duas em 320–390 px. Detalhado usa três colunas em 1440 px, duas em 768–1024 px e uma em celulares, sempre com capa de 120 px ao lado das informações. Trocar visualização não altera a URL nem consulta a API.

Filtros existentes são campos de texto ocultos em um drawer à direita. O botão sem borda com SlidersHorizontal, à esquerda de Pesquisar, abre Pesquisa avançada. Hover usa fundo neutro. Aplicar filtros fecha o painel e pesquisa; Limpar filtros conserva o termo aplicado. Fechar sem aplicar não altera a consulta; Pesquisar usa apenas os filtros já aplicados, sem incorporar rascunhos pendentes. Escape, botão fechar e clique fora dispensam o painel, com foco devolvido ao ícone. O componente adapta o Drawer shadcn/Base UI usando @base-ui/react e CSS local, sem tema global. Título e capa abrem `/books/:googleBooksId`. Capa ausente/quebrada mostra “Capa indisponível”; autor, editora e data têm contingências textuais. Capas usam proporção 2:3 e conservam a imagem inteira.

Favoritos reutilizam `createOrUpdate`, desabilitam o botão durante envio e atualizam o livro nas seções e resultados. Visitantes seguem ao login com pathname, query e hash no retorno. Carregamento e vazio usam `role="status"`; resultados expõem `aria-busy`; erros usam `role="alert"` com o vermelho #b42318 já aprovado em autenticação/Perfil. Falha de carregamento oferece Tentar novamente. Paginação preserva a pesquisa e leva o usuário ao início dos resultados.

## Evidência e limites

A tarefa principal reportou 22 testes de backend, build e lint aprovados. Navegador com respostas simuladas verificou filtros isolados/combinados, paginação de vinte livros, modos sem nova requisição, rota antiga, vazio, erro/nova tentativa e favoritos simulados. A ausência de overflow foi verificada em 320px, 768px e 720px; 720px foi reflow equivalente a 200%, sem zoom real. Esses mocks não comprovam Google Books ao vivo ou persistência real de favoritos.

As seis capturas de descoberta/pesquisa/modos e as capturas `explore-error-desktop.png` e `explore-empty-desktop.png` em `.impeccable/review/` usam imagens locais no harness. A produção continua recebendo capas da API; nenhum novo asset raster foi incorporado. A revisão independente Impeccable concluiu disposition ship no verdict pass, com os três achados resolvidos (documentação, vermelho semântico herdado e disclosure). Estado atualizado e contrato visual: [.impeccable/explore-brief.md](../.impeccable/explore-brief.md).

Fontes: `frontend/src/pages/ExplorePage.tsx`, `frontend/src/components/ExploreBookCard.tsx`, `frontend/src/styles/explore.css`, `frontend/src/components/SiteHeader.tsx`, `frontend/src/pages/SearchPage.tsx`, `frontend/src/services/bookService.ts` e `backend/src/main/java/com/joaocuculo/letterbooks/controllers/BookController.java`.

## Refinamento do campo de pesquisa

O botão Pesquisar fica dentro do campo em formato de pílula, alinhado à direita, com borda discreta e sombra suave seguindo a referência enviada. Mantém o botão preto e envio por Enter. A barra tem 48 px; seus botões têm 36 px no desktop com ponteiro preciso e 44 px em telas até 760 px ou dispositivos de toque. Em 320px, o ícone decorativo é ocultado para reservar espaço ao texto; o botão continua integrado. A descoberta solicita até 12 livros por seção, inclusive no fallback local; a pesquisa permanece com 20 por página.

## Drawer de pesquisa avançada — 2026-10-10

Componente compartilhável em `frontend/src/components/Drawer.tsx`, adaptado da [documentação shadcn](https://ui.shadcn.com/docs/components/base/drawer). Base UI cuida do diálogo modal, foco e bloqueio de rolagem do fundo. O painel pode rolar em telas baixas; movimento reduzido desativa transições. Revisão com API simulada verificou filtro isolado, vinte resultados, fechamento por Escape, retorno do foco, Tab contido, ausência de campos na tela com painel fechado e largura de 320px. Capturas em `.impeccable/review/explore-drawer-desktop.png` e `explore-drawer-mobile.png`. A escala tipográfica existente foi preservada.

## Escala compacta de catálogo

A classe reutilizável `catalog-density`, em `frontend/src/styles/catalog-density.css`, concentra os tokens de escala, espaçamento e densidade. É aplicada à página Explorar e ao drawer portaled. Header, logo e BookCardFrame consomem variáveis com os valores anteriores como padrão nas outras páginas; cores, arquivos da marca e fonte Manrope permanecem os mesmos.

- Conteúdo de até 1280 px, com padding de 24 px no desktop e 16 px no mobile.
- Header de 64 px no desktop e duas linhas de 44 px no mobile quando necessárias à navegação. Logo usa o mesmo arquivo, dimensionado para 180 px no desktop, 150 px no mobile e 120 px abaixo de 360 px.
- Títulos de página de 30 px (26 px no mobile), seções de 20 px, texto base de 14 px, rótulos e autoria de 13 px. Títulos dos livros mantêm 14 px e limite de duas linhas.
- Busca de 48 px. Botões de 36 px para ponteiro preciso e 44 px até 760 px ou quando `pointer: coarse`.
- Cards de cerca de 190 px em 1440 px, gaps de 18 px no desktop (16/12 px em telas menores), padding interno de 12/10 px e intervalo de 32/24 px entre seções. A grade usa `auto-fill`, preservando largura dos cards em resultados curtos.
- Capas mantêm a imagem inteira com `object-fit: contain` em área 2:3; detalhado usa largura de capa de 120 px em todas as resoluções. Coração à esquerda e menu à direita permanecem acessíveis por teclado.

Em 1440 px, o primeiro card passou de 242 para aproximadamente 190 px de largura e de 483 para 392 px de altura; o início da grade subiu de aproximadamente 384 para 213 px do topo. As seções continuam recebendo até doze livros, e a pesquisa continua recebendo vinte por página.

## Verificação desta revisão

Build e lint do frontend. Verificação de navegador com o adaptador Axios simulado de `docs/qa/explore-density.html`: para reproduzir, copiar o arquivo para `frontend/density-check.html`, iniciar o Vite e abrir essa página. Remover a cópia temporária depois. Parâmetros suportados: `route` (rota inicial), `mode=edge` (títulos sem espaços e capas ausentes/quebradas), `error` (primeira consulta falha), `visitor` e `save-error`.

Densidade, overflow e controles conferidos em 320, 360, 390, 640, 768, 1024, 1280, 1440 e 1920 px; modo detalhado conferido em 320, 390, 768, 1024 e 1440 px. Sem rolagem horizontal nas verificações. Em 320 px, a grade mantém duas colunas e o header ficou em 88 px para visitante e usuário simulado. Inputs de celular mantêm 16 px.

Também verificados: vinte resultados, envio de pesquisa, filtros de autor, paginação preservando filtros, troca de visualização sem nova requisição, Escape/retorno do foco no drawer, menu de estantes, favorito com bloqueio durante envio, vazio, falha/nova tentativa e retorno ao login para visitante. Essas verificações não comprovam Google Books ao vivo nem persistência em conta real. Nenhuma lógica de negócio, contrato, rota ou biblioteca foi alterada nesta revisão; não foi utilizado o Impeccable.
