# Auditoria da proposta do LetterBooks

Data: 12/10/2026. Referência: proposta de TCC enviada pelo usuário, cinco páginas; requisitos nas páginas 2–3, diagrama geral na página 3 e modelo relacional na página 4.

## Resultado principal

**O sistema não está integralmente alinhado a tudo que aparece na proposta, embora seu núcleo funcional já esteja implementado.**

- Dos **17 requisitos funcionais textuais**, 16 estão contemplados na implementação inspecionada e 1 diverge do intervalo de notas previsto. Não encontrei um requisito funcional textual inteiro ausente do frontend.
- Os **4 requisitos não funcionais textuais** têm implementação identificável. Isso não é certificação de segurança, desempenho ou funcionamento em produção.
- O diagrama acrescenta relatórios que não estão totalmente contemplados: média de avaliações ausente; livros por autor/categoria com atendimento parcial por filtros.
- Há funcionalidades de backend ainda sem fluxo de frontend. A inconsistência de alteração de e-mail identificada originalmente foi corrigida em 12/10/2026; veja a atualização ao final deste relatório.

Os identificadores RF/RNF abaixo foram atribuídos nesta auditoria, na ordem do documento; a proposta original usa marcadores, sem esses códigos. “Atendido” significa que encontrei tela/ação e implementação correspondente, não que executei um teste real de todas as operações.

## Método e limites

Leitura de todas as páginas do PDF, extração textual e inspeção visual das páginas 2–4, incluindo os diagramas. Inspeção das rotas React, serviços frontend, oito controllers (54 rotas HTTP declaradas), serviços backend, DTOs, entidades, repositories e fontes de testes. Não alterei funcionalidades nem dados de usuários.

Executados nesta rodada: `npm run build`, `npm run lint` e `mvnw.cmd -o -Dtest=RegisterRequestTests,BookshelfQueryTests test`. Os dois grupos de backend totalizaram **16 testes, zero falhas**: quinze validações de cadastro e uma verificação das consultas de estantes com Hibernate sem conexão a banco. O build manteve o aviso conhecido de bundle acima de 500 kB; isso não foi requisito quantitativo da proposta.

Não executei fluxo completo com PostgreSQL, Google Books, SMTP ou contas reais nesta auditoria. Testes/capturas simuladas anteriores constam em `docs/admin.md`, `docs/my-books.md`, `docs/explore.md` e `docs/book-details.md`; são evidência anterior, não novos testes de integração. Não foi executado `LetterbooksApplicationTests.contextLoads`, que inicia o contexto da aplicação. Não encontrei suíte automatizada de frontend/E2E configurada no package.json.

## 1. Requisitos funcionais da proposta

No vocabulário atual, as “listas personalizadas” da proposta são **Estantes**; favoritos e estados de leitura são agrupamentos da Biblioteca. “Categorias” administrativas são os assuntos/metadados das obras, não estantes pessoais.

| ID | Requisito previsto | Resultado | Frontend / evidência | Backend / observação |
|---|---|---|---|---|
| RF-01 | Cadastro de usuários | Atendido | [Cadastro](C:/Projetos/letterbooks/frontend/src/pages/RegisterPage.tsx) | [AuthController](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/controllers/AuthController.java): POST /auth/register; cadastro devolve JWT. |
| RF-02 | Autenticação por login e senha | Atendido | [Login](C:/Projetos/letterbooks/frontend/src/pages/LoginPage.tsx) | [AuthController](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/controllers/AuthController.java): POST /auth/login; AuthenticationManager e JWT. |
| RF-03 | Marcar lido ou quero ler | Atendido | [BookDetailsPage](C:/Projetos/letterbooks/frontend/src/pages/BookDetailsPage.tsx) e [LibraryBookCard](C:/Projetos/letterbooks/frontend/src/components/LibraryBookCard.tsx) | [UserBookController](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/controllers/UserBookController.java): POST e PATCH; COMPLETED e WANT_TO_READ. |
| RF-04 | Adicionar livros a listas | Atendido | [AddToShelfDialog](C:/Projetos/letterbooks/frontend/src/components/AddToShelfDialog.tsx) | [BookshelfController](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/controllers/BookshelfController.java): POST /bookshelves/{id}/book. |
| RF-05 | Remover livros de listas | Atendido | [ShelfManager](C:/Projetos/letterbooks/frontend/src/components/ShelfManager.tsx) | [BookshelfController](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/controllers/BookshelfController.java): DELETE /bookshelves/{id}/book/{bookId}, separado da remoção da biblioteca. |
| RF-06 | Criar listas personalizadas | Atendido | [ShelfEditor](C:/Projetos/letterbooks/frontend/src/components/ShelfEditor.tsx) | [BookshelfController](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/controllers/BookshelfController.java): POST /bookshelves. |
| RF-07 | Editar listas personalizadas | Atendido | [ShelfEditor](C:/Projetos/letterbooks/frontend/src/components/ShelfEditor.tsx) | [BookshelfController](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/controllers/BookshelfController.java): PATCH /bookshelves/{id}. |
| RF-08 | Remover listas personalizadas | Atendido | [ShelfManager](C:/Projetos/letterbooks/frontend/src/components/ShelfManager.tsx) | [BookshelfController](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/controllers/BookshelfController.java): DELETE /bookshelves/{id}; cascata de vínculos, sem excluir obras. |
| RF-09 | Registrar avaliações por notas | Divergente | [RatingForm](C:/Projetos/letterbooks/frontend/src/components/RatingForm.tsx) e [StarRating](C:/Projetos/letterbooks/frontend/src/components/StarRating.tsx:84) | [RatingRequestDTO](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/dto/request/RatingRequestDTO.java): intervalo 0–5, enquanto o texto da proposta prevê 1–5. |
| RF-10 | Comentários em avaliações | Atendido | [RatingForm](C:/Projetos/letterbooks/frontend/src/components/RatingForm.tsx) | [RatingController](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/controllers/RatingController.java): campo comment, opcional; publicação associada à avaliação. |
| RF-11 | Editar avaliações | Atendido | [BookDetailsPage](C:/Projetos/letterbooks/frontend/src/pages/BookDetailsPage.tsx) | [RatingController](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/controllers/RatingController.java): PATCH /ratings/{id}; proprietário verificado. |
| RF-12 | Remover avaliações | Atendido | [BookDetailsPage](C:/Projetos/letterbooks/frontend/src/pages/BookDetailsPage.tsx) | [RatingController](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/controllers/RatingController.java): DELETE /ratings/{id}; confirmação no frontend. |
| RF-13 | Buscar livros | Atendido | [ExplorePage](C:/Projetos/letterbooks/frontend/src/pages/ExplorePage.tsx) | [BookController](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/controllers/BookController.java): GET /books/search; termo e filtros, paginação e fallback local. |
| RF-14 | Persistir livros somente após interação | Atendido | [ExplorePage](C:/Projetos/letterbooks/frontend/src/pages/ExplorePage.tsx) e [BookDetailsPage](C:/Projetos/letterbooks/frontend/src/pages/BookDetailsPage.tsx) consultam sem gravar | [BookService](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/services/BookService.java): busca/detalhes não salvam; findOrCreate é usado por relações, avaliações e associação à estante. |
| RF-15 | Exigir autenticação para comentar, avaliar e organizar | Atendido | [ProtectedRoute](C:/Projetos/letterbooks/frontend/src/components/ProtectedRoute.tsx) e ações com retorno ao login | [SecurityConfig](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/config/SecurityConfig.java): mutações autenticadas; autorização adicional nos serviços. |
| RF-16 | E-mail único | Atendido | [Cadastro e mensagens da API](C:/Projetos/letterbooks/frontend/src/pages/RegisterPage.tsx) | [UserService](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/services/UserService.java): existsByEmail; [User](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/entities/User.java:29): coluna única. |
| RF-17 | Recuperação de senha com validação do usuário | Atendido | [Recuperação](C:/Projetos/letterbooks/frontend/src/pages/ForgotPasswordPage.tsx) e [Redefinição](C:/Projetos/letterbooks/frontend/src/pages/ResetPasswordPage.tsx) | [PasswordResetService](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/services/PasswordResetService.java): token enviado por e-mail, armazenado como hash, validade de uma hora, uso único e invalidação das sessões antigas. |

**Sobre RF-09:** a opção “Sem estrelas” envia uma nota real igual a zero; não significa ausência de avaliação. Esse comportamento foi aprovado posteriormente durante o desenvolvimento. A decisão agora é atualizar a proposta/artigo para 0–5 ou restringir o sistema a 1–5. Trata-se de diferença de escopo, não de ausência da funcionalidade de avaliar.

**Sobre RF-16:** a unicidade está implementada para o valor armazenado. A política de equivalência entre maiúsculas/minúsculas de e-mail não é definida na proposta e não há normalização uniforme no backend. Convém definir essa política antes de prometer unicidade semântica entre variantes do mesmo endereço.

## 2. Requisitos não funcionais textuais

| ID | Requisito | Resultado e evidência | Limite da conclusão |
|---|---|---|---|
| RNF-01 | Senhas com hash BCrypt | Implementado: [PasswordEncoder BCrypt](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/config/SecurityConfig.java:75); cadastro, alteração, reset e seeder usam encode. | Não inspecionei dados reais de senhas no banco. |
| RNF-02 | Autenticação JWT | Implementado: [TokenConfig](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/config/TokenConfig.java), [SecurityFilter](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/config/SecurityFilter.java), rotas públicas específicas e demais autenticadas. JWT assinado, expira em duas horas; filtro consulta situação/versão do usuário. | Não equivale a teste de invasão; há a inconsistência de e-mail descrita adiante. |
| RNF-03 | Authorization: Bearer Token | Implementado: [interceptor Axios](C:/Projetos/letterbooks/frontend/src/services/api.ts:19); [leitura Bearer](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/config/SecurityFilter.java:32). | Conferência por código; não capturei tráfego de uma sessão real. |
| RNF-04 | Arquitetura em camadas | Implementado: controllers, services, repositories, DTOs, mappers e entidades; frontend separado em páginas/componentes/hooks/serviços/tipos. | Presença da separação não comprova escalabilidade em carga ou manutenção ao longo do tempo. |

Os objetivos de interface responsiva, facilidade de uso, segurança e escalabilidade são qualitativos. Há CSS responsivo, componentes acessíveis, paginação, caches e revisões simuladas anteriores. Não encontrei avaliação com usuários, teste de carga ou metas mensuráveis na proposta. Classificação: suporte de implementação presente, comprovação abrangente pendente; esses objetivos não devem ser anunciados como comprovados apenas porque build e lint passaram.

## 3. Funcionalidades do diagrama geral

O diagrama da página 3 também integra o planejamento e precisa ser considerado na apresentação ao orientador.

| Item do diagrama | Resultado | Análise |
|---|---|---|
| Cadastro de usuário | Atendido | Cadastro, login e perfil implementados. Não confundir com um painel administrativo completo de usuários. |
| Cadastro de livro | Atendido por importação | Livros são importados da Google Books quando há interação. Não existe cadastro manual de obras, mas o documento não exige explicitamente esse formulário; importação respeita RF-14. |
| Cadastro de autor e categoria | Atendido | Criação administrativa e resolução automática de metadados, incluindo nomes alternativos e união de registros. |
| Cadastro de estante | Atendido | Criação, edição, exclusão, visibilidade e itens. |
| Movimentação: avaliação | Atendido com divergência de faixa | Criar/editar/excluir notas e comentários; 0–5 em vez de 1–5. |
| Movimentação: itens da estante | Atendido | Adicionar/retirar; adição inclui relação inicial em Quero ler quando necessário. |
| Relatório: média das avaliações | **Ausente** | Não encontrei agregação AVG, DTO de média, endpoint nem exibição de média de avaliações do LetterBooks. As estrelas mostradas são notas individuais. |
| Relatório: livros por categoria | **Parcial** | Explorar pesquisa por Assunto e o fallback local consulta categorias; não há relatório dedicado do catálogo persistido por categoria ou ligação na administração. |
| Relatório: livros por autor | **Parcial** | Explorar pesquisa por Autor e há filtro local; não há relatório dedicado do catálogo persistido por autor ou ligação na administração. |
| Relatório: estantes por usuário | Atendido para o próprio usuário | Minha Biblioteca lista as próprias estantes e totais. Backend permite consultar estantes públicas de outro usuário autenticado; não existe navegação de usuários/compartilhamento completa. |

Autor/categoria podem ser considerados atendidos por consultas filtradas se esse era o significado pretendido de “relatório”. O documento não define formato, agrupamento, exportação ou estatísticas desses dois relatórios. Portanto, marquei parcial e recomendo validar esse entendimento com o orientador, em vez de inventar exigência de PDF/Excel.

Evidências dos relatórios: [RatingRepository](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/repositories/RatingRepository.java), [BookResponseDTO](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/dto/response/BookResponseDTO.java), [ratingService](C:/Projetos/letterbooks/frontend/src/services/ratingService.ts), [filtros locais](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/specifications/BookSpecifications.java), [ExplorePage](C:/Projetos/letterbooks/frontend/src/pages/ExplorePage.tsx) e [BookshelfService](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/services/BookshelfService.java).

## 4. Backend com capacidades ainda não expostas no frontend

Esta lista não significa que todos os itens abaixo são requisitos obrigatórios da proposta. Parte deles apareceu apenas no modelo de dados ou foi adicionada posteriormente.

| Capacidade | Backend existente | Situação no frontend | Relação com a proposta |
|---|---|---|---|
| Administração de usuários | GET /users; PUT /users/{id}/role-status; consultas/atualização por ID | Não há tela de listagem, alteração de papel ou ativação/inativação. Administração atual cobre autores/categorias. | Papel/status estão no modelo; o texto não exige painel administrativo de usuários. |
| Excluir a própria conta | DELETE /users/{id}, proprietário ou ADMIN | Perfil não oferece exclusão. | Não é requisito funcional textual explícito. A exclusão com vínculos deve ser validada no banco antes de prometer suporte completo. |
| Progresso e datas de leitura | POST/PATCH /user-books recebem currentPage, startedAt, finishedAt | Há tipos e exibição da página atual, mas não editor de progresso nem datas. | Campos previstos no modelo da página 4; funcionalidade de interface ainda ausente. |
| Minhas avaliações em uma lista | GET /ratings/user, paginado | É possível editar a própria avaliação em cada livro, mas não consultar todas numa tela única. | Endpoint existente; o texto exige CRUD de avaliações, que já funciona por livro, não essa tela adicional. |
| Todas as páginas de avaliações de um livro | GET /ratings/book/google/{id} aceita Pageable | ratingService não envia page; detalhes exibem apenas content da primeira página e não têm Anterior/Próxima. Com mais de 20 avaliações, as restantes não são navegáveis pela UI atual. | Limitação de leitura de experiências; não impede os RF de criar/editar/remover. |
| Moderação de avaliação alheia pelo administrador | DELETE /ratings/{id} permite ADMIN | Menu de excluir é oferecido somente para a própria avaliação; não há moderação administrativa. | Capacidade de backend adicional, não obrigação textual explícita. |
| Navegar/compartilhar estantes públicas de outras pessoas | GET /bookshelves/user/{userId}, summary e books aplicam visibilidade | Existe checkbox Pública e leitura de estante por shelfId para autenticados, mas não navegação de usuários, botão de compartilhamento ou acesso anônimo. | Visibilidade está no modelo. Compartilhar experiências já é possível por avaliações públicas; não presumir que publicar estantes era obrigação textual. |

Evidências: [UserController](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/controllers/UserController.java), [userService frontend](C:/Projetos/letterbooks/frontend/src/services/userService.ts), [Perfil](C:/Projetos/letterbooks/frontend/src/pages/ProfilePage.tsx), [UserBookController](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/controllers/UserBookController.java), [tipos de relação](C:/Projetos/letterbooks/frontend/src/types/userBook.ts), [exibição de página atual](C:/Projetos/letterbooks/frontend/src/components/LibraryBookCard.tsx), [RatingController](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/controllers/RatingController.java), [menu da própria avaliação](C:/Projetos/letterbooks/frontend/src/components/RatingsList.tsx), [BookshelfController](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/controllers/BookshelfController.java) e [ShelfManager](C:/Projetos/letterbooks/frontend/src/components/ShelfManager.tsx).

Endpoints antigos de detalhes e consultas individuais que foram substituídos por respostas menores ou por fluxos equivalentes não foram classificados automaticamente como funcionalidades faltantes. Nem todo endpoint precisa de uma página exclusiva.

## 5. Regras de negócio e consistência

### Contempladas na implementação

- Busca, descoberta e simples visualização não persistem obras; a escrita aparece nos fluxos de relação, avaliação e associação a estante.
- E-mail tem verificação de disponibilidade e restrição única na entidade.
- Livro/usuário possuem uma única relação e uma única avaliação, por restrições compostas e verificações de serviço.
- Usuário só altera sua relação/avaliação; administrador pode excluir avaliações de terceiros, conforme serviço.
- Estante privada só é consultável pelo proprietário; mutações exigem propriedade; nome de estante é único por usuário e associação duplicada é rejeitada.
- Excluir estante remove seus vínculos, não a obra; retirar item não exclui o livro da biblioteca.
- Adição à estante e inclusão inicial em Quero ler fazem parte da mesma transação; uma relação existente mantém seus dados.
- Redefinição valida token, expiração e uso único e invalida JWTs anteriores; senha é codificada com BCrypt.
- Cadastro exige confirmação; cadastro/reset/alteração usam força de senha consistente e limite de 72 bytes UTF-8.

Essas regras foram identificadas por leitura. A execução de dezesseis testes selecionados nesta rodada não cobre todas elas; a confirmação de integridade real, concorrência e rollback em PostgreSQL exige uma rodada de integração isolada.

### Inconsistência identificada originalmente — corrigida em 12/10/2026

O texto abaixo registra o achado antes da correção. A rota legada agora confirma a senha atual; não permanece um ponto aberto.

**Alterar e-mail tem dois caminhos com regras diferentes.** [updateProfile](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/services/UserService.java:100), usado por PATCH /users/me, exige senha atual quando o e-mail muda. Porém [update legado](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/services/UserService.java:81), usado por PUT /users/{id}, verifica propriedade/ADMIN e disponibilidade do e-mail, mas não confere a senha recebida. [UserRequestDTO](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/dto/request/UserRequestDTO.java) exige uma string de senha com mínimo de seis caracteres, que esse método não compara nem utiliza.

Pela leitura, um usuário autenticado pode usar a rota antiga para atualizar seu próprio e-mail sem provar conhecimento da senha atual. Não é ausência de JWT nem falha de unicidade; é um caminho alternativo que contorna a regra adotada no Perfil. Não fiz exploração em conta real. Recomendo unificar a política dos endpoints ou restringir/descontinuar o contrato legado com compatibilidade deliberada.

### Pontos a definir antes de completar progresso/publicação

- A validação de currentPage só executa quando o total de páginas não é nulo; em obras sem total, um número negativo não é bloqueado por essa validação. Não há definição/validação de ordem cronológica entre startedAt e finishedAt. Corrigir/definir junto do editor de progresso, sem tratar essas condições como requisitos inventados da proposta.
- O resumo da estante não inclui identificação do proprietário; ShelfManager pressupõe a biblioteca do autenticado e oferece edição mesmo em um shelfId público de outro usuário. Backend impede a mutação, mas um futuro fluxo público precisa mostrar somente ações permitidas.

## 6. Modelo relacional e evolução de escopo

As entidades centrais da figura estão presentes: usuários, livros, autores, categorias, avaliações, relações de leitura, estantes e itens, incluindo tabelas de associação livro/autor e livro/categoria. Persistência relacional está representada por JPA e driver PostgreSQL.

O modelo atual acrescenta PasswordReset, tokenVersion, AuthorName e CategoryName. User usa name em vez do username da figura. Book possui createdAt, mas não updatedAt mostrado no desenho. Esses pontos exigem atualizar o diagrama do artigo, não criar telas fictícias para cada campo. O desenho prevê currentPage/startedAt/finishedAt e is_public; o armazenamento existe, mas progresso e publicação completa ainda carecem dos fluxos identificados acima.

Também há capacidades além da proposta textual: confirmação e força de senha, login automático após cadastro, Perfil, Lendo/Abandonados, favoritos separados, aliases e união de autores/categorias, caches/fallbacks, ampliação da capa e seleção de estantes via diálogo. São evoluções, não prova automática de atendimento dos relatórios ausentes.

## 7. Ordem recomendada para fechar a proposta

1. **Política de alteração de e-mail no endpoint legado — concluída em 12/10/2026.** A correção compartilha validação com o Perfil e possui testes de regressão; as demais tarefas abaixo continuam pendentes.
2. **Alinhar o intervalo de notas com o documento.** Registrar 0–5 como mudança aprovada ou aplicar 1–5 em frontend, DTOs e entidade. Se houver dados zero, definir seu tratamento antes da alteração.
3. **Implementar a média das avaliações**, se o diagrama continuar fazendo parte da entrega. Calcular no backend sobre todas as avaliações; não calcular apenas os vinte comentários carregados.
4. **Definir com o orientador o significado de livros por autor/categoria.** Se filtros forem suficientes, demonstrá-los e documentar. Se forem relatórios de catálogo, completar endpoints/consultas e apresentação correspondente.
5. **Completar a paginação das avaliações** para dar acesso às páginas existentes no backend.
6. **Decidir o compromisso com os campos do modelo:** progresso/datas, estantes públicas e administração de usuários. Não precisam virar tarefas obrigatórias apenas por estarem modelados; escopo final deve ser explícito.
7. **Registrar testes de aceitação com dados isolados:** cadastro/login, e-mail duplicado, leitura sem gravação, CRUD de relações/estantes/avaliações, restrições de proprietário/ADMIN, token inválido/expirado/reutilizado, reset e rollback em banco. Acrescentar navegação por teclado, mobile e teste com usuários para sustentar usabilidade.
8. **Atualizar proposta/artigo e diagramas** para refletir o sistema entregue. Cronograma, revisão bibliográfica, artigo e banca não são funcionalidades auditáveis no código; esta análise não confirma a execução dessas atividades.

## Conclusão

É defensável afirmar que o núcleo de cadastro, autenticação, busca, biblioteca, estantes, avaliações e recuperação de senha está implementado. **Ainda não é defensável afirmar que tudo o que aparece na proposta foi contemplado sem ressalvas.** As diferenças de notas, o relatório de média, o significado dos relatórios por autor/categoria, e os fluxos de modelo ainda ausentes devem ser resolvidos ou formalmente registrados. A consistência da rota legada foi corrigida após este levantamento.


## Atualização: correção da troca de e-mail (12/10/2026)

`UserService.update` (PUT /users/{id}) e `updateProfile` (PATCH /users/me) agora usam a função privada `updateProfileData`, com normalização de nome/e-mail, confirmação de senha quando o e-mail muda e validação de disponibilidade antes de alterar qualquer campo.

- No legado, o nome JSON `password` foi preservado por compatibilidade; seu significado é senha atual, não nova senha. O campo é opcional quando o e-mail não muda, como no Perfil. Não se aplica política de força de nova senha a uma confirmação de credencial existente.
- Senha ausente, em branco ou incorreta impede a troca de e-mail e não salva nome/e-mail. Alterar apenas o nome não exige senha.
- Um ADMIN editando outra conta confirma a própria senha; um ADMIN editando a própria conta não tem bypass. As permissões de proprietário/administrador foram preservadas.
- A senha armazenada não é sobrescrita pelo campo de confirmação. Cadastro e alteração de senha mantêm seus DTOs e regras atuais; frontend não precisou mudar, pois já envia `currentPassword` para PATCH /users/me.

Os testes novos reproduziram o bypass antes da correção (incluindo PUT HTTP aceitando senha arbitrária). Após a correção, **25 testes novos passaram**, cobrindo as duas rotas, confirmação ausente/incorreta, e-mail duplicado, normalização, alteração só de nome, proprietário/ADMIN e respostas HTTP via MockMvc. A execução conjunta com cadastro, JWT de registro e alteração de senha passou em **65 testes, zero falhas**. Foram usados repositories/encoder simulados e MockMvc standalone, sem banco ou contas reais; esses testes HTTP não exercitam o filtro JWT completo.

Fontes: [UserService](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/services/UserService.java), [UserRequestDTO](C:/Projetos/letterbooks/backend/src/main/java/com/joaocuculo/letterbooks/dto/request/UserRequestDTO.java), [UserProfileUpdateTests](C:/Projetos/letterbooks/backend/src/test/java/com/joaocuculo/letterbooks/UserProfileUpdateTests.java).
