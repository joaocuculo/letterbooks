# Explorar — descoberta e pesquisa

Modo: Operate. Público: visitantes e leitores autenticados procurando livros para sua estante.

## Direction contract

THESIS: Uma página muda de descoberta para pesquisa submetida, dando espaço aos resultados sem perder os filtros.

OWN-WORLD: Branco, preto e cinzas de DESIGN.md; Manrope local, botões pretos, campos de borda fina e capas coloridas. Sem moldura externa ou decoração de landing page.

Erros mantêm a cor semântica vermelha #b42318 já aprovada nos formulários de acesso e perfil; a paleta neutra rege as superfícies e os controles.

STORY: O leitor navega por seleções de até doze livros ou pesquisa por termo e filtros existentes. Pode abrir detalhes, favoritar e navegar vinte resultados por página.

FIRST VIEWPORT: Descoberta com texto e busca centralizados e seções abaixo. Pesquisa com busca superior, filtros ocultos em drawer à direita e grade compacta de quatro colunas usando a largura disponível, com seletor para duas colunas detalhadas. Abaixo de 1024px, compacto usa duas colunas e detalhado uma; abaixo de 480px ambos usam uma.

FORM: Composição definida nos dois esboços do usuário e aprovada no plano; grade completa e visualização compacta escolhidas explicitamente. Implementação com React e CSS existentes, sem dependências adicionais.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Comportamento

- URL canônica `/explore`; `/search` redireciona com query e hash preservados.
- Termo e filtros submetidos pela ação ou Enter; parâmetros `q`, `title`, `author`, `publisher`, `subject`, `isbn` e `page`.
- Alterar filtros reinicia página; limpar filtros preserva termo aplicado, limpar pesquisa volta à descoberta.
- Alternar visualização não consulta API. Requisições substituídas são canceladas.
- Pesquisa avançada fica oculta em drawer à direita, aberta pelo botão SlidersHorizontal dentro da busca. Aplicar fecha o painel; Escape e fechar devolvem foco ao ícone.
- Visitante pode consultar; favoritos exigem login com retorno à URL atual.

## Validação

Registro da entrega em 2026-10-09. A tarefa principal reportou 22 testes de backend aprovados, build e lint do frontend aprovados. Dados simulados no navegador verificaram filtros isolados e combinados, aplicação/limpeza, vinte resultados por página, paginação, troca de visualização sem requisição, redirecionamento da rota antiga com query/hash, erro com nova tentativa, vazio e favoritos simulados.

Verificação de reflow sem overflow horizontal em larguras de 320px, 768px e 720px. A largura de 720px representa reflow equivalente à metade de uma viewport desktop de 1440px; não foi uma execução de zoom real de 200% do navegador. Mock de favoritos comprova o comportamento da interface, não a persistência em uma conta real. A integração externa do Google Books não foi validada ao vivo nesta revisão.

Capturas em `.impeccable/review/`: `explore-discovery-desktop.png`, `explore-discovery-mobile.png`, `explore-search-desktop.png`, `explore-search-mobile.png`, `explore-detailed-desktop.png`, `explore-detailed-mobile.png`, `explore-error-desktop.png` e `explore-empty-desktop.png`. As imagens locais pertencem apenas ao harness de revisão; a página de produção utiliza `thumbnailUrl` retornado pela API. Nenhum novo raster de produção foi criado e os registros de origem dos assets reutilizados permanecem preservados.

Revisão independente Impeccable: disposition ship no verdict pass. Os três achados foram pontuados como resolved: documentação, herança do vermelho semântico e disclosure dos filtros. A aprovação final tem o escopo desses achados e das recapturas; não representa validação da integração externa ao vivo. Documentação mesclada em DESIGN.md e PRODUCT.md; detalhes de contrato em `docs/explore.md`.

## Escopo e contexto preservado

Esta extensão mantém os tokens e `.impeccable/design.json` existentes. A descrição antiga de `/explore` como Home de descoberta e o link separado Pesquisar foram corrigidos em DESIGN.md. O fallback de descoberta já documentado em PRODUCT.md permanece intacto.

Drift preexistente: frontmatter de DESIGN.md e título/narrativa do sidecar ainda nomeiam Home Diagonal e Autenticação Galeria, embora existam extensões posteriores. Há seções históricas de recuperação e Perfil fora das oito seções canônicas. O brief do Perfil registra falha anterior do detector com `cache_directory_failed`; essa revisão documental não executou novamente o detector nem regenerou o sidecar. Esses registros não foram reparados como efeito colateral de Explorar.

## Refinamento aprovado — campo integrado e seções com 12 livros

Referência do usuário: campo em cápsula com botão interno à direita. Aplicado no componente SearchControls para descoberta e pesquisa, com botão preto e sombra suave; em 320px o ícone é ocultado para reservar espaço ao texto. DiscoverService usa SECTION_SIZE=12 para Google e fallback local; pesquisa permanece com 20 por página. Build, lint e 22 testes pertinentes aprovados. Navegador com mocks conferiu 12 itens por seção, 20 na pesquisa enviada por Enter e ausência de overflow em 320px. Evidências explore-input-desktop.png e explore-input-mobile.png. Revisão independente do refinamento: SHIP, sem achados materiais no escopo; detector não executado.
