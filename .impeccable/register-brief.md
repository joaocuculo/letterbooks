# Cadastro — Galeria

Modo: Operate. Extensão do login compacto aprovado pelo usuário.

## Direction contract

THESIS: mesmo modelo visual do login; apenas o conteúdo do formulário muda para cadastro.

OWN-WORLD: branco, preto e cinzas, Manrope local, campos de 44px e formulário até 350px. Cinco capas estáticas com proporção 2:3.

STORY: preencher nome, e-mail, senha e confirmação; receber validação, feedback da API e confirmação de cadastro; acessar login pelo link existente.

FIRST VIEWPORT: formulário à esquerda, galeria idêntica à direita, marca e voltar à Home. Sem rolagem externa; rolagem interna apenas se necessário para acessar conteúdo. Galeria oculta abaixo de 1024px.

FORM: composição definida pelo usuário, reutilizando layout e CSS do login. Preservar validações, endpoint, sucesso na própria tela, autocomplete e links. Confirmação de senha e requisitos visíveis adicionados; validação correspondente no backend, sem nova entidade.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Implementação e evidência

Cabeçalho e galeria do login compacto extraídos intactos para `frontend/src/layouts/AuthGalleryLayout.tsx`, compartilhados por LoginPage e RegisterPage com o CSS existente `frontend/src/styles/login.css`. A rota `/register` usa o layout Galeria diretamente, sem o AppLayout anterior. Home preservada. Manrope, formulário até 350px, controles de 44px, galeria decorativa estática de cinco capas locais, proporção 2:3 e ocultação abaixo de 1024px permanecem idênticos ao login.

Cadastro contém Nome, E-mail, Senha e Confirme sua senha, com normalização de nome/e-mail, autocomplete, endpoint e link para login. Confirmação obrigatória e igualdade verificadas no cliente. A apresentação atual substitui a lista por uma única mensagem vermelha com a primeira exigência pendente, atualizada ao digitar e removida quando válida. Regras preservadas: 8 a 72 unidades UTF-16, maiúscula Unicode, minúscula Unicode, número ASCII e pontuação/símbolo Unicode. Há validação adicional do limite BCrypt de 72 bytes UTF-8, com mensagem de senha muito longa. Loading informa aria-busy, desabilita campos/botão e mostra “Cadastrando...”. Erros são anunciados com role="alert", aria-invalid e descrição associada. Sucesso permanece na própria tela, limpa ambas as senhas e usa role="status".

Evidência da versão anterior à confirmação e aos requisitos: capturas locais: `.impeccable/review/register-desktop.jpg` (1520×728), `register-tablet.jpg` (820×1180), `register-mobile.jpg` (320×568) e `register-login-regression.jpg`. Medidas DOM não indicaram overflow externo nas três viewports de cadastro. O formulário conserva rolagem interna somente quando necessário para acesso ao conteúdo. Build e lint passaram; revisão final com disposição `ship`, consistente em desktop, tablet, 320px e na regressão do login. Validação local do frontend: campos vazios geram três alertas; e-mail inválido e senha menor que seis caracteres geram dois alertas. Essas verificações não representam cadastro real no backend.
## Confirmação e requisitos de senha

`RegisterRequest` inclui confirmPassword; sucesso limpa password e confirmPassword. O backend usa o DTO de cadastro dedicado `RegisterRequestDTO`, validado com @Valid no AuthController; `UserRequestDTO`, compartilhado com edição, permanece intacto. O DTO não é entidade e a confirmação não é persistida. UserService concentra a checagem de igualdade e tamanho UTF-8 em validatePasswords; validateEmailAvailable é reutilizado por cadastro, update e updateProfile.

Build e lint passaram para essa extensão. Os 22 testes backend passaram (15 do DTO e sete do serviço); revisão final com disposição `ship`. Evidência visual atual: `.impeccable/review/register-password-desktop.jpg` (1520×820), `register-password-mobile.jpg` (390×844) e `register-password-small-mobile.jpg` (320×568). Desktop e mobile alto mostram o fluxo; em 320px, as ações abaixo permanecem acessíveis por rolagem interna. As capturas e contagens de alertas anteriores documentam a versão sem confirmação.

Validação no navegador: quatro alertas para campos vazios, divergência entre senhas, senha fraca e os cinco requisitos atendidos. O harness isolado `.impeccable/review/register-password-check.html`, com adapter Axios, confirmou confirmPassword no payload, campos/botão desabilitados no envio por Enter, status “Cadastrado com sucesso!” e limpeza dos dois campos de senha. Não houve criação de conta real nem teste da UI contra o backend real. O arquivo temporário do harness no frontend foi removido; a evidência está preservada em `.impeccable/review/`.
## Validação progressiva — ajuste aprovado
Lista e estilos antigos removidos. Um único helper valida tanto a digitação quanto o envio; uma mensagem vermelha aparece sob a senha e some quando válida. Verificação no navegador confirmou as cinco exigências em sequência e ausência de mensagem para senha válida. Build e lint passaram; revisão visual desktop e celular sem defeitos identificados. Capturas: register-single-error-desktop.jpg e register-single-error-mobile.jpg em .impeccable/review/.
`nAjuste aprovado: rolagem interna removida do formulário compartilhado. Página usa min-height:100svh e crescimento natural; padding desktop inferior reduzido para 24px. Em alturas insuficientes, a página inteira rola sem cortar campos, foco ou ações. Verificado em desktop e 320px sem overflow horizontal.

Visibilidade de senha: controle independente nos dois campos, acessível por teclado e clique. Verificação no navegador confirmou alternância independente password/text e retorno para password, sem envio do formulário. Revisão visual mobile aprovada; captura register-password-eyes-mobile.jpg em .impeccable/review/.

