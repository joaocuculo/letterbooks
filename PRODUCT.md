# LetterBooks

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Leitores que querem avaliar e gerenciar livros. Projeto de TCC com entrega prevista para o fim de outubro de 2026.

## Product Purpose

Registrar a relação pessoal com livros: quero ler, lendo, lidos, favoritos, notas e comentários nas próprias avaliações. A referência funcional é o Letterboxd aplicado a livros.

## Capabilities and Constraints

React com TypeScript e Vite, Tailwind e CSS; Java 21, Spring Boot e PostgreSQL. Backend implementado, frontend em desenvolvimento. Cadastro, autenticação, recuperação de senha, busca, biblioteca e criação/edição de avaliações já possuem integração. Detalhes do livro permitem excluir a própria avaliação e consultar as estantes personalizadas que contêm o livro. A interface de gerenciamento de listas personalizadas (Bookshelf) ainda está pendente.

Google Books fornece descoberta e busca. Livros só são persistidos após uma interação. A busca possui alternativa local quando a API falha; a descoberta usa buscas temáticas em texto livre e consulta livros persistidos quando o Google falha ou não retorna livros utilizáveis. Se nenhuma seção temática puder ser preenchida, apresenta “Do nosso catálogo” com livros já persistidos. A Home de apresentação não depende dessa API.

## Brand Commitments

Nome LetterBooks. Conteúdo em português. O usuário pediu páginas claras e modernas, capas protagonistas, referências de Pinterest, Apple, Notion e Stripe. A Home Diagonal foi aprovada com interface em preto, branco e cinza fixos, preservando as cores das capas. A comparação entre modelos e o seletor de cores foram encerrados. Login e Cadastro Galeria estendem essa identidade com formulários simples e cinco capas locais estáticas no mesmo layout compartilhado; recuperação de senha usa formulário central e capas em escada; a redefinição de senha compartilha essa composição. O cadastro exige confirmação de senha e informa cinco requisitos: 8 a 72 unidades UTF-16, maiúscula e minúscula Unicode, número ASCII e pontuação/símbolo Unicode; frontend e backend também aplicam limite de 72 bytes UTF-8 do BCrypt. A confirmação não é armazenada. O cadastro retorna JWT, autentica pelo signIn existente e redireciona para a Home.

## Evidence on Hand

Esboço do usuário: capas diagonais à esquerda, texto à direita e avaliações sobrepostas abaixo do texto, com gradiente para o restante da página. As avaliações da Home são exemplos explicitamente ilustrativos, não depoimentos reais. As capas locais representam edições em inglês com títulos apresentados em português. Não há métricas, preços ou prova social confirmados.

## Pendências de acesso

- Reformular o HTML do e-mail de recuperação após definição da logo, alinhando a identidade visual ao site. Template atual: backend/src/main/resources/templates/email-password-reset.html. Manter placeholders e instruções de expiração ao reformular.

## Cadastro autenticado

POST /auth/register retorna 201 com id, name, email e token JWT. UserService preserva validações e BCrypt e retorna o usuário criado internamente; AuthController usa TokenConfig, o mesmo do login, e expõe somente RegisterResponseDTO. Frontend usa signIn e redireciona para / com replace, sem nova chamada ao login. Redesign do e-mail permanece pendente.

## Perfil da conta

`/profile` permite consultar os dados da conta, editar nome/e-mail e alterar senha. Reutiliza o cabeçalho da Home e a identidade neutra aprovada. O resumo mostra iniciais, nome, e-mail, tipo, situação e data de cadastro; não inclui estatísticas nem upload de foto. Falha no carregamento oferece Tentar novamente.

Os contratos existentes permanecem: `GET /users/me`, `PATCH /users/me` e `PATCH /users/me/password`. Alterar somente o nome dispensa senha; alterar o e-mail revela e exige a senha atual. Após salvar, o resumo e a identidade autenticada são atualizados por `refreshUser`. Alterar senha exige senha atual, nova senha diferente e confirmação local; frontend e backend aplicam as regras de cadastro/redefinição: 8–72 unidades UTF-16, maiúscula e minúscula Unicode, número ASCII, pontuação/símbolo Unicode e até 72 bytes UTF-8 para BCrypt. A confirmação não é enviada nem persistida. Sucesso limpa os campos de senha e mantém a sessão autenticada. Evidência e limites de verificação estão em `.impeccable/profile-brief.md`.

## Explorar livros

`/explore` reúne descoberta e pesquisa em uma superfície pública. A descoberta mostra grades completas de até doze livros por seção; a pesquisa solicita vinte resultados por página e aceita termo livre, título, autor, editora, assunto e ISBN. Filtros existentes permanecem campos de texto. Alterações são aplicadas por envio e reiniciam a página; limpar filtros conserva o termo aplicado e limpar pesquisa retorna à descoberta. A URL permite compartilhar e recuperar a pesquisa. `/search` preserva query e fragmento ao redirecionar para `/explore`; o cabeçalho oferece um único link Explorar.

Visualização compacta é o padrão; detalhada acrescenta editora e data sem uma nova consulta. Livros abrem os detalhes existentes, com contingência para capas ausentes. Favoritos reutilizam a integração atual e exigem autenticação, com retorno à URL de origem após login. Carregamento, vazio e falha com nova tentativa são estados explícitos. A superfície estende a identidade neutra aprovada, sem novo sistema visual. Evidência e limites: `.impeccable/explore-brief.md` e `docs/explore.md`.

## Detalhes do livro

`/books/:googleBooksId` consolida o modelo Biblioteca aprovado, encerrando a comparação com Apresentação e Editorial. Apresenta capa ampliável, título, autoria, sinopse, informações da edição e avaliações em cartões cinza arredondados. Pessoas autenticadas podem favoritar, escolher Quero ler/Lendo/Lido/Abandonado, remover da biblioteca com confirmação e criar/editar avaliação inline com estrelas de 0 a 5 e comentário opcional. “Sem estrelas” seleciona explicitamente zero. O menu da própria avaliação oferece editar e excluir; excluir exige confirmação e preserva o livro na biblioteca. Cancelar descarta o rascunho; falha de envio o preserva. Visitantes seguem ao login com retorno à origem.

O cartão “Na sua biblioteca”, abaixo da edição, reúne status/favorito e nomes das estantes personalizadas reais, sem links; desaparece quando não há associação. A consulta autenticada `GET /bookshelves/book/google/{googleBooksId}/me` retorna somente id/nome de estantes do proprietário e não persiste livros. Falhas de livro, avaliações públicas, operação pessoal e estantes têm nova tentativa localizada; falhar nas avaliações não oculta o livro. A extensão mantém a identidade neutra compacta, sem novas dependências ou migrações. Exclusão usa o contrato existente `DELETE /ratings/{id}`. Média e paginação de avaliações não foram acrescentadas. Evidências, revisão e limites: `.impeccable/book-details-brief.md` e `docs/book-details.md`.
