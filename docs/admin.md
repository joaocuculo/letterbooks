# Administração de autores, categorias e usuários

As quatro rotas administrativas estendem a identidade neutra aprovada. Não houve mudança de serviços, API, backend, dependências ou migrações. Implementação compartilhada: `AdminShell`, `CatalogList`, `CatalogDetails`, `AdminControls` e `catalogConfig`, com quatro wrappers de página e CSS isolado em `frontend/src/styles/admin.css`.

## Acesso e navegação

`AppLayout` reconhece as quatro rotas de autores/categorias e `/admin/users`, usando `AdminShell`, com SiteHeader, abas Autores/Categorias/Usuários e conteúdo sem o rodapé antigo. ProtectedRoute exige autenticação; AdminRoute exige papel ADMIN. Carregamento e falha de identidade mantêm o cabeçalho e permitem nova tentativa. Pessoas autenticadas sem ADMIN são redirecionadas à Home; visitantes, ao login, sem consultar o catálogo administrativo.

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

## Listagem de usuários — 13/10/2026

`/admin/users` oferece consulta de nome, e-mail, ID, papel, situação e data de cadastro. O dropdown dos cabeçalhos inclui Usuários somente para ADMIN; a navegação administrativa também oferece essa aba. A autorização reutiliza ProtectedRoute e AdminRoute e impede a consulta antes da identidade ser autorizada.

`findUsers` consulta `GET /users?page={page}&size=20&sort=createdAt,desc`, recebe `PageResponse<UserResponse>` e aceita AbortSignal. `UsersAdminPage` reutiliza useLibraryResource, AdminFailure e AdminPager. A URL mantém página com índice zero, histórico e recarregamento; valores inválidos usam zero e páginas excedentes são ajustadas. Durante o carregamento, a paginação fica desabilitada. Há estados de vazio, erro acessível e nova tentativa.

Rótulos e data brasileira são compartilhados com Perfil em `userPresentation.ts`, preservando sua apresentação. A listagem usa linhas com identificação e metadados lado a lado no desktop e empilhados em telas menores, com quebra de textos extensos.

Build e lint passaram. A validação com respostas Axios simuladas cobriu páginas de 20/20/5 registros, total, ordenação enviada, URL, histórico, recarregamento, página inválida/excedente, carregamento, consultas substituídas, vazio, falha de conexão, 403 e nova tentativa. Visitante, usuário comum e estados de carregamento/falha da identidade não consultaram `/users`. Navegação pelo dropdown com teclado e aba ativa foram conferidas. Textos extensos em 320px, 768px e reflow de 640×500 não apresentaram overflow horizontal; reflow não equivale a testar zoom real do navegador.

Capturas com dados fictícios: `.impeccable/review/users-desktop.png` (1440×1000) e `.impeccable/review/users-mobile.png` (320×700). O diretório é apenas o armazenamento local de evidências já utilizado pelo projeto; a skill Impeccable não foi usada nesta etapa. O fixture de revisão não integra o frontend publicado.

Não houve alterações no backend, contratos, dependências ou migrações. A listagem inicial foi ampliada com a alteração de papel/situação descrita abaixo. Criação, edição de dados pessoais e exclusão de usuários continuam fora da interface administrativa.

## Alteração de papel e situação — 13/10/2026

Cada conta oferece “Alterar papel e situação”, abrindo um diálogo Base UI com opções Usuário/Administrador e Ativa/Inativa. Os valores atuais são preenchidos; salvar sem alterações fica desabilitado. A descrição explica o acesso administrativo e o efeito da inativação. A própria conta tem a ação desabilitada com a explicação da regra existente no backend.

`updateUserRoleAndStatus` usa `PUT /users/{id}/role-status` com `{ role, status }`, recebendo UserResponse. Durante o envio, campos, salvar, cancelar e fechamento do diálogo ficam bloqueados. Erros vermelhos mantêm a seleção e permitem tentar salvar novamente; cancelar não envia requisição. Após sucesso, a página atual é recarregada, mostra uma mensagem acessível e o foco retorna ao título; cancelar retorna o foco ao botão de abertura.

O backend não precisou mudar: o controller já exige ADMIN e UserService rejeita alterações na própria conta. SecurityFilter consulta papel e situação atuais do banco a cada requisição autenticada; a interface não altera os JWTs de outras pessoas.

Testes com respostas simuladas cobriram promoção, rebaixamento, inativação, reativação, manutenção da página, ausência de envio ao cancelar, seleção preservada em falhas, bloqueio durante envio e foco. Diálogo revisado em desktop e 320px, com capturas `users-edit-desktop.png` e `users-edit-mobile.png` no mesmo diretório de evidências. Nenhuma conta real foi alterada; sem Impeccable, novas dependências ou migrações.

## Proteção do último administrador ativo

Na etapa de exclusão da própria conta, o backend passou a impedir exclusão, inativação e rebaixamento que removam o último ADMIN ativo. A regra é compartilhada por UserService e usa transações SERIALIZABLE; conflitos retornam 409 e mensagem para tentar novamente. A listagem administrativa já apresenta essas mensagens no diálogo de edição. Administradores inativos não contam para manter acesso administrativo. A exclusão da própria conta está no Perfil; exclusão administrativa de outras contas continua sem interface. Detalhes e testes em `docs/account-deletion.md`.
