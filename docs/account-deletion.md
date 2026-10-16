# Exclusão da própria conta

Implementada em 13/10/2026 no Perfil, reutilizando PasswordInput, diálogo Base UI e a identidade existente, sem Impeccable, dependências novas ou migrações.

## Interface e confirmação

A seção “Excluir minha conta” fica após os formulários. O diálogo explica a irreversibilidade e os dados removidos, exige senha atual e oferece Cancelar/Excluir definitivamente. A senha atual não recebe regras de força; senhas curtas existentes continuam aceitas. Fechar descarta a senha; cancelar não envia DELETE e devolve o foco ao botão. Durante envio, campos, ações, Escape e fechamento ficam bloqueados. Erros vermelhos mantêm o diálogo e permitem nova tentativa.

Após 204, a credencial local é removida imediatamente. A navegação substitui o Perfil pela Home, onde o contexto de autenticação é encerrado e a mensagem de sucesso é exibida. A confirmação no estado de navegação é consumida para o histórico não encerrar uma sessão futura. Essa sequência evita que a rota protegida redirecione ao Login durante o encerramento.

## API e regras

`DELETE /users/{id}` permanece retornando 204. Para excluir a própria conta, recebe `{ "currentPassword": "..." }`. Corpo ausente ou senha vazia é rejeitado; a senha é conferida com PasswordEncoder.matches. O campo não é registrado em logs de revisão. A autorização existente permanece: proprietário ou ADMIN; exclusão de outra conta por ADMIN não exige corpo e continua disponível apenas na API.

UserService carrega novamente o solicitante dentro da transação e verifica situação ativa e papel atual, sem depender apenas dos dados do JWT. Exclusão de ADMIN ativo, inativação ou rebaixamento exigem outro ADMIN ativo. Contas ADMIN inativas não contam. A regra é compartilhada na função privada validateRemainingActiveAdmin; a proibição de alterar as próprias permissões permanece.

Exclusão e alteração de papel/status usam SERIALIZABLE. O PostgreSQL rejeita conflitos concorrentes que poderiam violar a regra. Não há repetição automática de ações destrutivas: o handler retorna 409 com mensagem para tentar novamente. Erros de acesso ao banco retornam mensagem segura, sem SQL ou detalhes internos.

## Dados e sessão

As operações bulk dos repositories excluem, nesta ordem: itens das estantes, estantes, avaliações, relações de leitura, tokens de recuperação e usuário. Tudo ocorre em uma transação, incluindo flush final. Falhas desfazem as alterações. Não são carregadas todas as coleções em memória.

Livros, autores, categorias e dados de outras contas são preservados. Não há anonimização ou recuperação da conta. O SecurityFilter existente recarrega o usuário pelo ID do JWT: após exclusão, o token deixa de autenticar. Tokens de recuperação são removidos e rejeitados pelo fluxo existente de reset.

## Validação

AccountDeletionTests cobre senha ausente/incorreta, senha curta existente, autorização, papel desatualizado no JWT, conta inativa/ausente, ordem das operações, administrador ativo, exclusão administrativa e proteção de papel/status. MockMvc valida o contrato HTTP, rejeição de corpo vazio e mensagem segura em conflitos de serialização.

AccountDeletionPostgresTests usa configuração JPA separada e banco temporário local, sem carregar o perfil dev. Há sete testes reais: limpeza com preservação de catálogo e dados de outra conta, exclusão sem vínculos/JWT rejeitado, ADMIN inativo não contado, rollback com trigger de falha e três disputas concorrentes — exclusões simultâneas, exclusão versus inativação e exclusão versus rebaixamento. Tokens de recuperação antigos também são rejeitados. Todos passaram.

Execução com PostgreSQL isolado:

```powershell
./mvnw.cmd '-Dtest=*,!LetterbooksApplicationTests' '-Ddeletion.test.url=jdbc:postgresql://127.0.0.1:55439/letterbooks_deletion_test' test
```

A URL só é aceita para banco local com nome `letterbooks_deletion_test`, usando usuário de teste `codex_test`. O teste cria/remove o esquema e deve ser executado exclusivamente em instância descartável. Sem a propriedade, esses sete testes são ignorados; os testes de unidade permanecem disponíveis. A rodada passou com 132 testes selecionados e excluiu o teste genérico de inicialização da aplicação para não acessar o banco configurado no perfil dev.

No navegador, API simulada e AuthProvider real em origem local separada verificaram senha vazia, cancelamento, olho da senha, senha incorreta/nova tentativa, último ADMIN, falha de conexão, bloqueio de Escape durante envio, remoção do token, encerramento de sessão e Home. Desktop 1440×1000, celular 320×700 e reflow 640×500 foram revisados sem overflow horizontal. Reflow não testa zoom real do navegador.

Capturas: `.impeccable/review/account-deletion-desktop.png` e `.impeccable/review/account-deletion-mobile.png`. O diretório apenas reutiliza o armazenamento local de evidências; a skill não foi usada. Fixture não integra o frontend publicado. Nenhuma conta real foi excluída. Build e lint passaram, com o aviso conhecido do Vite sobre tamanho do bundle.

O PostgreSQL temporário e o servidor de revisão foram encerrados. A revisão automática bloqueou por política a remoção recursiva do diretório `C:/Users/Usuario/AppData/Local/Temp/letterbooks-deletion-test-pg`; os arquivos temporários da instância descartável permaneceram nesse local.
