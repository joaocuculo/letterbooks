# Recuperação — Escada

Modo: Operate. Direção aprovada: formulário central sem card externo e capas em escada no canto inferior direito, cortadas pela metade nas duas bordas. Preto, branco e cinza, Manrope local, mesmos controles do login/cadastro. Não reproduzir moldura do esboço.

AuthGalleryLayout recebe variante opcional recovery, mantendo gallery como padrão. Dez imagens locais existentes, sem downloads, com origem preservada. A decoração é estática, aria-hidden, sem interatividade e oculta abaixo de 1024px. Sem rolagem interna ou horizontal; página cresce quando necessário. A tela de redefinição não faz parte desta etapa.

Validação: desktop 1280x720, intermediário 1024x768, tablet 820x1180, celular 390x844 e 320x568, viewport reduzida 640x360. Sem overflow horizontal; galeria oculta nos tamanhos previstos e overflow do formulário visível. Centro horizontal medido sem desvio, dez assets carregados. Viewport reduzida valida reflow equivalente; zoom real do navegador não foi automatizado.

Capturas em .impeccable/review/recovery-desktop.jpg e recovery-mobile.jpg. Campo vazio e e-mail inválido verificados no navegador. Harness recovery-check.html usa a página real com adapter Axios isolado, sem requisições externas, para verificar endpoint, normalização, Enter, campos desabilitados, carregamento, sucesso genérico e falha de conexão. Build e lint passaram. Revisão visual final: aprovado, composição coerente com o esboço e sem sobreposição observada.

## Extensão para redefinição

/reset-password usa a mesma variante recovery, incluindo ausência de token com alerta vermelho e solicitação de novo link. Campos Nova senha e Confirmar nova senha reutilizam PasswordInput, com olhos independentes. Preservados mínimo existente de seis caracteres, confirmação local, POST /auth/reset-password com token e newPassword, erro 401 e redirecionamento ao login com mensagem de sucesso. Sem mudança no backend ou nas regras de senha.

Verificado em desktop 1280x720 e celular 320x568, sem rolagem horizontal ou interna. Capturas reset-desktop.jpg e reset-mobile-errors.jpg. Harness simulado confirmou divergência, envio por Enter, loading com todos os controles desabilitados, payload, sucesso com destino login e token expirado. Nenhuma senha real foi alterada. Revisão visual aprovada.

