# Perfil — conta e segurança

Modo: Operate. Extensão da Home e dos formulários de autenticação aprovados, sem substituir o sistema visual existente.

## Direction contract

THESIS: consultar a conta, editar dados e alterar senha em uma página clara, com hierarquia simples e identidade da Home.

OWN-WORLD: branco, preto e cinzas, Manrope local, cabeçalho compartilhado de 68px, campos de pelo menos 44px e ações pretas em cápsula. Resumo suave com avatar de iniciais; formulários planos com separador fino.

STORY: reconhecer os dados atuais, atualizar nome/e-mail com confirmação por senha somente para novo e-mail e trocar a senha mantendo a sessão. Carregamento, falhas, nova tentativa e sucesso permanecem na página.

FIRST VIEWPORT: título Meu perfil; resumo de conta à esquerda, Dados pessoais e Alterar senha em sequência à direita. Conteúdo até 1120px, coluna de resumo de 300px e intervalo de 80px; empilhamento abaixo de 1024px. Página com crescimento e rolagem naturais.

FORM: preservar contratos de API e autenticação. Reutilizar SiteHeader, PasswordInput, auth-fields.css e getPasswordError. Não acrescentar estatísticas, upload, dependências ou endpoints. A troca de senha aplica no backend as mesmas regras já usadas por cadastro e redefinição.

FINISH: revisão final com disposição ship, documentação atualizada e evidências preservadas.

## Implementação

ProfilePage usa SiteHeader compartilhado com a Home. O resumo apresenta iniciais derivadas do nome, nome, e-mail, tipo de conta, situação e data formatada em pt-BR. Abaixo de 1024px, os blocos empilham em até 680px; abaixo de 481px, metadados viram uma coluna e ações ocupam toda a largura. Não há galeria decorativa ou formulário com rolagem interna.

Dados pessoais preserva GET/PATCH /users/me. Nome e e-mail são aparados antes do envio. O campo de senha atual aparece somente quando o e-mail difere do salvo; alteração de nome envia currentPassword nulo. Sucesso atualiza o resumo, chama refreshUser e limpa a confirmação de senha atual. Falha no carregamento mostra alerta e Tentar novamente.

Alterar senha preserva PATCH /users/me/password com currentPassword e newPassword. Confirmação é local; nova senha deve ser diferente da atual. O helper compartilhado mostra uma exigência pendente por vez em vermelho e oculta a mensagem quando válida. Frontend e backend exigem 8–72 unidades UTF-16, maiúscula e minúscula Unicode, número ASCII e pontuação/símbolo Unicode; limite adicional de 72 bytes UTF-8 protege BCrypt. Sucesso limpa os três campos e mantém a sessão.

Campos e olhos independentes mantêm autocomplete, foco visível e associação de erros por aria-invalid/aria-describedby. Envios por Enter funcionam; cada formulário sinaliza aria-busy e desabilita seus controles durante o envio. Alertas usam role="alert"; sucesso e carregamento usam role="status".

## Evidência de conclusão

Revisão final: ship, sem correções materiais. Build e lint finais passaram. Foram informados 56 testes backend aprovados, incluindo 16 novos casos de alteração de senha. O documenter conferiu ProfilePage.tsx, SiteHeader.tsx, profile.css, auth-fields.css, login.css, home.css, userService.ts, getPasswordError.ts e os documentos existentes.

O navegador com API/AuthContext simulados verificou nome, conflito de e-mail, confirmação condicional, atualização por Enter, exigências de senha, divergência da confirmação, senha atual incorreta, olhos, sucesso, nova tentativa após falha, conexão indisponível e navegação por teclado/foco/menu. Foram verificados 320px, tablet a 768px e reflow a 720×450px. A largura de 720px equivale ao espaço disponível de desktop de 1440px a 200%; isso não verifica zoom real do navegador. Não houve alteração de conta ou senha real por esse harness.

Capturas: `.impeccable/review/profile-desktop.png` e `.impeccable/review/profile-mobile.png`. Harness preservado: `.impeccable/review/profile-check.html`; entrada temporária do frontend removida.

## Drift preservado

O detector de drift falhou com cache_directory_failed; nenhum reparo automático foi aplicado. DESIGN.md e seu sidecar já contêm escopo/título anteriores e registros históricos, incluindo a limitação a Home/login/cadastro, seguida de extensões posteriores. Esta etapa acrescenta somente a extensão do Perfil; não regenera tokens ou sidecar nem reescreve registros de cadastro/recuperação que descrevem versões anteriores. Esses registros não passam a ser decisões do Perfil.
