# Explorar

`/explore` reúne descoberta pública e pesquisa submetida. `SearchPage` redireciona `/search` para a rota canônica com `replace`, preservando query e hash. SiteHeader oferece um único link Explorar, compartilhado pela Home e pelo Perfil.

## Estado e pesquisa

Sem termo ou filtros aplicados, a página consulta `GET /books/discover` e renderiza grades completas de até doze livros por seção. Com algum valor aplicado, consulta `GET /books/search`. O serviço frontend envia `size=20`; BookController também usa vinte como tamanho padrão. A URL contém `q`, `title`, `author`, `publisher`, `subject`, `isbn` e `page`. `q` corresponde a `freeText` na API. Página é baseada em zero; ausente ou inválida equivale a zero e a interface mostra números a partir de um.

Termo e filtros possuem rascunho local e são aplicados por Pesquisar, Aplicar filtros ou Enter. Não há consulta a cada tecla. Novo envio reinicia a página; reenviar a pesquisa aplicada dispara nova tentativa. Limpar filtros conserva o termo já aplicado, e Limpar pesquisa remove parâmetros e retorna à descoberta. Mudanças de URL restauram os campos. Cada nova consulta cancela a anterior por AbortController.

## Apresentação e ações

A descoberta mantém introdução e busca centralizadas. Na pesquisa, a busca ocupa o topo e os resultados usam toda a largura disponível. Compacto é o padrão: quatro colunas no desktop, duas abaixo de 1024px e uma abaixo de 480px. Detalhado usa duas no desktop e uma abaixo de 1024px, acrescentando editora e data ao lado da capa. Trocar visualização não altera a URL nem consulta a API.

Filtros existentes são campos de texto ocultos em um drawer à direita. O botão sem borda com SlidersHorizontal, à esquerda de Pesquisar, abre Pesquisa avançada. Hover usa fundo neutro. Aplicar filtros fecha o painel e pesquisa; Limpar filtros conserva o termo aplicado. Fechar sem aplicar não altera a consulta; Pesquisar usa apenas os filtros já aplicados, sem incorporar rascunhos pendentes. Escape, botão fechar e clique fora dispensam o painel, com foco devolvido ao ícone. O componente adapta o Drawer shadcn/Base UI usando @base-ui/react e CSS local, sem tema global. Título e capa abrem `/books/:googleBooksId`. Capa ausente/quebrada mostra “Capa indisponível”; autor, editora e data têm contingências textuais. Capas usam proporção 2:3 e conservam a imagem inteira.

Favoritos reutilizam `createOrUpdate`, desabilitam o botão durante envio e atualizam o livro nas seções e resultados. Visitantes seguem ao login com pathname, query e hash no retorno. Carregamento e vazio usam `role="status"`; resultados expõem `aria-busy`; erros usam `role="alert"` com o vermelho #b42318 já aprovado em autenticação/Perfil. Falha de carregamento oferece Tentar novamente. Paginação preserva a pesquisa e leva o usuário ao início dos resultados.

## Evidência e limites

A tarefa principal reportou 22 testes de backend, build e lint aprovados. Navegador com respostas simuladas verificou filtros isolados/combinados, paginação de vinte livros, modos sem nova requisição, rota antiga, vazio, erro/nova tentativa e favoritos simulados. A ausência de overflow foi verificada em 320px, 768px e 720px; 720px foi reflow equivalente a 200%, sem zoom real. Esses mocks não comprovam Google Books ao vivo ou persistência real de favoritos.

As seis capturas de descoberta/pesquisa/modos e as capturas `explore-error-desktop.png` e `explore-empty-desktop.png` em `.impeccable/review/` usam imagens locais no harness. A produção continua recebendo capas da API; nenhum novo asset raster foi incorporado. A revisão independente Impeccable concluiu disposition ship no verdict pass, com os três achados resolvidos (documentação, vermelho semântico herdado e disclosure). Estado atualizado e contrato visual: [.impeccable/explore-brief.md](../.impeccable/explore-brief.md).

Fontes: `frontend/src/pages/ExplorePage.tsx`, `frontend/src/components/ExploreBookCard.tsx`, `frontend/src/styles/explore.css`, `frontend/src/components/SiteHeader.tsx`, `frontend/src/pages/SearchPage.tsx`, `frontend/src/services/bookService.ts` e `backend/src/main/java/com/joaocuculo/letterbooks/controllers/BookController.java`.

## Refinamento do campo de pesquisa

O botão Pesquisar fica dentro do campo em formato de pílula, alinhado à direita, com borda discreta e sombra suave seguindo a referência enviada. Mantém o botão preto, envio por Enter e área de toque de pelo menos 44px. Em 320px, o ícone decorativo é ocultado para reservar espaço ao texto; o botão continua integrado. A descoberta solicita até 12 livros por seção, inclusive no fallback local; a pesquisa permanece com 20 por página.

## Drawer de pesquisa avançada — 2026-10-10

Componente compartilhável em `frontend/src/components/Drawer.tsx`, adaptado da [documentação shadcn](https://ui.shadcn.com/docs/components/base/drawer). Base UI cuida do diálogo modal, foco e bloqueio de rolagem do fundo. O painel pode rolar em telas baixas; movimento reduzido desativa transições. Revisão com API simulada verificou filtro isolado, vinte resultados, fechamento por Escape, retorno do foco, Tab contido, ausência de campos na tela com painel fechado e largura de 320px. Capturas em `.impeccable/review/explore-drawer-desktop.png` e `explore-drawer-mobile.png`. A escala tipográfica existente foi preservada.

## Escala compacta

Título principal de 26–36px, títulos de seção de 22px, texto base de 14px e capas de até 180px. Busca mantém controles de 44px e tem menos padding; campos em celular conservam fonte de 16px. Área de conteúdo de até 1120px; a grade e o drawer preservam o comportamento anterior. Captura atual: `.impeccable/review/compact-explore-desktop.png`.
