# E-mail de redefinição de senha

O template em `backend/src/main/resources/templates/email-password-reset.html` aplica a identidade monocromática LetterBooks ao e-mail transacional. O serviço mantém assunto, remetente configurado, assinatura pública e construção do link existentes. Não há alterações em tokens, expiração, API, banco ou frontend.

## Composição e compatibilidade

- Painel branco até 600px sobre fundo cinza suave, borda discreta, cantos de 16px e conteúdo à esquerda.
- Padding interno de 32px e externo de 24px; até 600px, 24px e 12px, respectivamente.
- Logo oficial, título Redefina sua senha, saudação, explicação, botão preto de pelo menos 48px e validade de uma hora.
- URL completa clicável e copiável, aviso para solicitação não reconhecida e rodapé com ano atual.
- Prévia da caixa de entrada oculta no corpo; assunto preservado: Recuperação de Senha - LetterBooks.
- Arial/Helvetica/sans-serif, título de 28px, corpo de 16px e auxiliares de 13–14px. Fontes externas não são carregadas.
- Layout com tabelas `role="presentation"`, estilos essenciais inline e media query complementar. Não usa CSS do site, JavaScript ou componentes React.
- Tema claro com cores explícitas, atributos `bgcolor` e metadados de preferência. A imagem tem fundo branco próprio, mas inversões automáticas dependem do aplicativo. Não existe tema escuro dedicado.
- Bordas arredondadas e ajustes responsivos podem variar entre clientes; o conteúdo e o link continuam disponíveis sem esses estilos. Outlook clássico para Windows não é um alvo específico desta etapa.

## Logo e mensagem MIME

Fonte da marca: `frontend/public/brand/png/logo-horizontal/letterbooks-logo-horizontal-preto-740.png`.

Recurso do backend: `backend/src/main/resources/email/letterbooks-logo.png`. Foi derivado por composição do canal alfa do original sobre branco, sem redesenho ou mudança de tamanho. É um PNG RGB opaco de 740×160px, exibido em 185×40px. O arquivo usado no site permanece intacto.

Ao atualizar a marca, repetir essa composição e substituir o recurso do backend. Não usar uma captura de tela nem converter a logo em texto HTML.

`EmailService` define primeiro as alternativas `text/plain` e `text/html`, depois incorpora `image/png` com `Content-ID: <letterbooks-logo>`, referenciado como `cid:letterbooks-logo`. O nome e a URL são escapados no HTML; texto simples recebe seus valores legíveis. O ano é calculado uma única vez por mensagem. O stream de leitura do template é fechado com try-with-resources.

A logo não depende de hospedagem HTTPS. Quando imagens são bloqueadas, seu alt LetterBooks identifica a marca e o restante da mensagem permanece textual. O corpo em texto simples contém a saudação, o link, a expiração e a orientação para solicitações não reconhecidas.

## Verificação reproduzível

Na pasta `backend`, com Java 21:

```powershell
.\mvnw.cmd "-Dtest=EmailServiceTests,ResetPasswordTests" "-Dletterbooks.email.preview-dir=target/email-preview" test
```

Os quatro testes de `EmailServiceTests` verificam a mensagem serializada e relida: destinatário, remetente, assunto, alternativas, bytes da logo, CID, dimensões/fundo opaco, conteúdo, ano, escape, URL longa e links idênticos. Também verificam que falhas SMTP continuam sendo propagadas para o fluxo existente. Os dezesseis testes de redefinição permanecem passando.

A propriedade opcional de prévia grava HTML, texto e EML em `backend/target/email-preview/`; não faz envio. Para renderizar localmente, resolver o CID usando a imagem embutida no EML, sem alterar o template de produção. Esses artefatos são temporários e ignorados pelo Git.

## Resultados de 29/10/2026

- 20 testes executados, sem falhas ou erros.
- Prévias no Chromium em 320px, 390px e 900px; painel desktop limitado a 600px. Foram inspecionados os cenários normal, nome sem espaços/URL longos e logo bloqueada: nove combinações sem overflow horizontal ou cortes, botão de 48px.
- Um envio ao host `sandbox.smtp.mailtrap.io`, usando o próprio `EmailService`, foi capturado no sandbox. Destinatário fictício: `qa-letterbooks@example.test`; token `preview-only-not-a-valid-token`, nunca cadastrado no banco.
- A mensagem capturada foi baixada pela API e inspecionada: alternativas HTML/texto, logo inline com CID e bytes idênticos ao recurso, dois links iguais e instruções de expiração presentes. A prévia visual foi gerada a partir dessa captura.
- Nenhuma mensagem enviada a caixas reais; nenhuma chamada de solicitação/redefinição de senha foi feita para gerar o teste.

Essa validação confirma composição MIME, captura SMTP e renderização no navegador. Não equivale a teste em Gmail/Outlook reais nem a garantia de aparência em todas as inversões de modo escuro.
