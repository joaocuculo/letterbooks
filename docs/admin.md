# Administração de autores e categorias

As quatro rotas administrativas estendem a identidade neutra aprovada. Não houve mudança de serviços, API, backend, dependências ou migrações. Implementação compartilhada: `AdminShell`, `CatalogList`, `CatalogDetails`, `AdminControls` e `catalogConfig`, com quatro wrappers de página e CSS isolado em `frontend/src/styles/admin.css`.

## Acesso e navegação

`AppLayout` reconhece as quatro rotas e usa `AdminShell`, com SiteHeader, abas Autores/Categorias e conteúdo sem o rodapé antigo. ProtectedRoute exige autenticação; AdminRoute exige papel ADMIN. Carregamento e falha de identidade mantêm o cabeçalho e permitem nova tentativa. Pessoas autenticadas sem ADMIN são redirecionadas à Home; visitantes, ao login, sem consultar o catálogo administrativo.

Listas consultam vinte registros por página e mostram nome, ID, Gerenciar e total da API. `page` na URL é índice a partir de zero; o texto da paginação começa em um. Valores inválidos usam zero e páginas acima do total são ajustadas à última. Gerenciar grava a URL da lista em Router state. Voltar aceita somente o caminho da listagem correspondente, com query opcional; sem estado válido, retorna à primeira página. O histórico recupera a página anterior.

## Criação e nomes

A ação Novo autor/Nova categoria abre diálogo Base UI. Autor cria um registro individual. Categoria mantém o contrato que aceita nomes separados por `/` e retorna vários registros independentes. Nome vazio é rejeitado localmente; erros da API ficam no diálogo, preservando o valor. Enter envia e Escape fecha quando não há envio; o foco retorna à ação de abertura.

Detalhes consultam registro e nomes em paralelo. Nome principal é identificado; alternativos oferecem Tornar principal e Remover. Adicionar aceita Enter, limpa o campo somente após sucesso e conserva o rascunho quando falha. Remover exige confirmação; cancelar não envia DELETE. Ao confirmar com sucesso, o foco volta ao H1 e os nomes são consultados novamente. O conteúdo existente permanece durante essa atualização.

## União

A seção Unir começa fechada, sem consulta de candidatos. Abrir carrega vinte registros por página; o ID atual é excluído das opções. Radios selecionam uma única origem. O registro aberto permanece destino, e ambos aparecem com nome/ID antes da confirmação.

A confirmação informa que a origem será excluída e seus nomes e livros serão transferidos ao destino. Cancelar não envia POST. Confirmar bloqueia controles até concluir; falha conserva o diálogo e mostra nova tentativa por meio da mesma ação. Sucesso retorna à listagem de origem com mensagem e dados atualizados.

## Contratos preservados

Para cada recurso, o prefixo é `/authors` ou `/categories`:

| Operação | Contrato existente |
| --- | --- |
| Lista | `GET {prefixo}?page={page}&size=20` |
| Registro | `GET {prefixo}/{id}` |
| Criar | `POST {prefixo}` com `{ name }` |
| Nomes | `GET {prefixo}/{id}/names` |
| Adicionar nome | `POST {prefixo}/{id}/names` com `{ name }` |
| Tornar principal | `PATCH {prefixo}/{id}/names/{nameId}/primary` |
| Remover nome | `DELETE {prefixo}/{id}/names/{nameId}` |
| Unir autores | `POST /authors/merge` com `targetAuthorId` e `sourceAuthorId` |
| Unir categorias | `POST /categories/merge` com `targetCategoryId` e `sourceCategoryId` |

`useLibraryResource` reutiliza AbortController para consultas e descarta respostas abortadas. ID inválido não consulta registro ou nomes. Carregamento, vazio e erro com Tentar novamente são explícitos. Mutações bloqueiam ações concorrentes; campos usam rótulos e erros associados, erros usam `role="alert"` e resultados usam `role="status"`.

## Evidências e limites

Build e lint finais passaram, com apenas o aviso conhecido do Vite sobre chunk maior que 500 kB. Fluxos de navegador foram exercitados com adapter Axios e dados simulados, sem contas reais: criação vazia/duplicada/sucesso por Enter, duas categorias por `/`, manutenção de nomes, cancelamento sem chamada destrutiva, foco após remoção, união e retorno, falhas conservando rascunho/diálogo, paginação e histórico, ajuste de página 999, carregamento com nova tentativa, vazio, ID inválido, registro ausente e controle de acesso.

Nomes longos e DOM em 320px, 768px e 640×500 não apresentaram overflow horizontal. A medida de 640×500 verifica reflow, sem testar zoom real. Nove capturas em 1440×1000 e 320×700 estão listadas em `.impeccable/admin-brief.md`. O revisor independente `admin_finish_reviewer` revisou todas as nove capturas e código contra o craft floor e concluiu **ship**, sem correções materiais.

O launcher Impeccable falhou com `cache_directory_failed`; a sessão declarou fallback manual e não executou detector. Não há comp aprovado: o trabalho é uma extensão code-led do sistema existente. DESIGN.md recebeu apenas uma seção administrativa em Components; frontmatter e `.impeccable/design.json` permanecem intactos. Drift preexistente não foi corrigido. O fixture ignorado `.impeccable/review/admin-check.html` serve somente à revisão local e não integra o frontend publicado.
