# Administração de Autores e Categorias

## Direction contract

**THESIS:** manutenção administrativa direta de registros e nomes. A extensão Operate usa o sistema neutro já aprovado, sem nova identidade nem comparação de variantes.

**OWN-WORLD:** Manrope local de 14px, branco/preto/cinza, título de 28–32px, controles de 44px, até 1080px úteis e abas sublinhadas. Listas planas e divisórias organizam o trabalho; CSS administrativo isolado.

**STORY:** o administrador encontra um autor ou categoria, abre seus nomes e corrige o catálogo. União explicita destino e origem, exclusão da origem e transferência de nomes e livros. Serviços e contratos existentes permanecem.

**FIRST VIEWPORT:** SiteHeader, abas Autores/Categorias, título e ação de criação, total e primeiras linhas. Detalhes mostram Voltar, identificação, nomes e formulário; a união começa recolhida. A página rola naturalmente, sem o rodapé antigo.

**FORM:** extensão code-led de mundo estabelecido, sem comp aprovado ou nova seleção de mundo. Criação em diálogo Base UI confirmada pelo usuário; autores individuais e categorias múltiplas separadas por `/`.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Entrega

Quatro rotas: `/admin/authors`, `/admin/authors/:authorId`, `/admin/categories`, `/admin/categories/:categoryId`. Listas preservam vinte registros por página, URL `page`, nome/ID/Gerenciar e total da API. Router state conserva a página no retorno do detalhe; acesso direto retorna à página zero. Valores de página inválidos usam zero; páginas acima do total são ajustadas à última disponível.

Nomes alternativos podem ser adicionados, tornados principais e removidos com confirmação Base UI. A união consulta candidatos somente ao abrir, em páginas de vinte, excluindo o ID atual e permitindo uma única origem. Confirmação identifica origem e destino; sucesso retorna à listagem com mensagem. Não houve mudança de backend, API, dependências ou migrações.

O hook existente `useLibraryResource` reutiliza AbortController e evita aplicar respostas obsoletas. Detalhes conservam conteúdo durante nova consulta. Erros são vermelhos, anunciados e associados ao campo quando aplicável; sucesso usa status. Enter envia criação e nome alternativo. Operações bloqueiam ações concorrentes; falhas preservam rascunhos e confirmações. Remoção confirmada devolve foco ao H1.

## Verificação concluída

Build e lint finais passaram. Vite informou apenas o aviso conhecido de chunk maior que 500 kB. Navegador com adapter Axios simulado, sem contas reais: criação de autor vazio/duplicado/novo por Enter, foco de retorno e Escape; duas categorias por `/` e total; adicionar nome, mudar principal, cancelar remoção sem DELETE e confirmar com foco no H1; cancelar união sem POST e confirmar com retorno/total atualizado; falhas de salvar e unir conservando rascunho/diálogo; página 1 → detalhe → Voltar e histórico; página 999 ajustada à última (2); carregamento com nova tentativa, lista vazia, ID inválido sem GET e registro ausente com nova tentativa; autorização carregando/com erro mantém cabeçalho, não administrador vai à Home e visitante ao login, sem GET administrativo.

Nomes longos, 320px, tablet de 768px e reflow de 640×500 foram verificados sem overflow horizontal no DOM. O reflow não substitui teste de zoom real do navegador. Nove capturas válidas com fixtures, em 1440×1000 ou 320×700:

- `.impeccable/review/admin-authors-desktop.png`
- `.impeccable/review/admin-authors-mobile.png`
- `.impeccable/review/admin-categories-desktop.png`
- `.impeccable/review/admin-categories-mobile.png`
- `.impeccable/review/admin-author-detail-desktop.png`
- `.impeccable/review/admin-author-detail-mobile.png`
- `.impeccable/review/admin-category-detail-desktop.png`
- `.impeccable/review/admin-category-detail-mobile.png`
- `.impeccable/review/admin-create-mobile.png`

O revisor independente `admin_finish_reviewer` realizou revisão completa das nove capturas e do código contra o craft floor, com disposição **ship**, sem correções materiais. São evidências simuladas, sem prova de mutações reais no backend.

## Documentação e limites

PRODUCT.md registra a capacidade administrativa atual; DESIGN.md acrescenta somente o componente Administração dentro de Components; `docs/admin.md` registra fluxo, contratos e evidência. O frontmatter de DESIGN.md e `.impeccable/design.json` foram preservados. Nenhum raster novo foi criado para entrega ao produto; capturas de revisão são evidência de desenvolvimento.

O launcher Impeccable falhou anteriormente nesta sessão com `cache_directory_failed`; fallback manual declarado, sem detector executado. A superfície é uma extensão do mundo estabelecido, sem comp aprovado. Drift preexistente dos documentos fica fora do escopo e não foi reparado. O fixture de navegador fica em `.impeccable/review/admin-check.html`, ignorado pelo Git, fora do frontend publicado.
