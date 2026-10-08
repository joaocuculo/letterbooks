# Login — Galeria

Modo: Operate. Público: leitores que entram na conta ou retornam de uma rota protegida.

## Direction contract

THESIS: autenticação simples à esquerda e cinco capas reais à direita; formulário sem card externo.

OWN-WORLD: identidade aprovada da Home, branco, preto e cinzas, Manrope local, bordas finas e botão preto. As capas fornecem cor.

STORY: informar e-mail e senha, recuperar acesso ou seguir para cadastro; preservar feedback e destino após autenticação.

FIRST VIEWPORT: cabeçalho compacto com marca e voltar à Home; formulário até 350px à esquerda, composição estática de Água viva, Noites brancas, Duna, O hobbit e Orgulho e preconceito à direita. Uma capa central alta, quatro ao redor. Abaixo de 1024px apenas formulário centralizado; página de 100svh sem rolagem externa, com rolagem interna do formulário somente quando necessário.

FORM: composição Galeria definida diretamente pelo usuário e esboço, sem seleção aleatória. Sem movimento, rodapé ou menu principal. Backend, API, cadastro e recuperação preservados.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Implementação e evidência

Login Galeria implementado em `frontend/src/pages/LoginPage.tsx` e `frontend/src/styles/login.css`. Manrope local, formulário até 350px, cabeçalho de 68px (56px até 650px de altura) somente com marca e voltar, inputs de no mínimo 44px com borda `#858d89`. Cinco capas JPEG locais reutilizadas por ISBN, estáticas e decorativas; registros de origem existentes preservados. Galeria oculta abaixo de 1024px. Cadastro, recuperação e integração de autenticação preservados.

Capturas locais de revisão em `.impeccable/review/login-desktop.jpg`, `login-mobile.jpg` e `login-small-mobile.jpg`; capturas complementares de tablet, desktop pequeno e viewport reduzida no mesmo diretório. A viewport de 720×480 verifica espaço equivalente a uma tela de 1440×960 com zoom de 200%; não constitui teste de zoom real do navegador.

Validação da UI local incluiu formulário, responsividade, foco, feedback e rolagem. O harness isolado `.impeccable/review/login-check.html` usa adapter Axios e contexto de autenticação controlados para verificar 401, falha de rede, loading com campos/botão desabilitados, mensagem de sucesso recebida pela navegação, chamada de `signIn` e redirecionamento para `/my-books?filter=read#list`. Esses cenários validam o frontend; não são evidência de uma sessão com backend real.

Na versão anterior ao refinamento compacto, build e lint passaram após o ajuste de contraste da borda e anúncio de erros por `role="alert"`. A revisão dessa versão conferiu as capturas desktop, mobile e small-mobile sem defeito material e registrou disposição `ship`; borda `#858d89` com contraste 3.40:1 sobre branco. DESIGN.md, `.impeccable/design.json` e PRODUCT.md atualizados com a extensão do login, preservando a documentação da Home.

## Refinamento compacto

Formulário reduzido de 380px para 350px, inputs e botão de 50px para 44px, espaços menores e bloco posicionado mais acima. A página ocupa 100svh sem rolagem externa; o formulário tem overflow-y: auto somente quando não cabe, para preservar acesso em alturas muito baixas, mensagens de erro e teclado aberto. Até 650px de altura, cabeçalho de 56px, título de 32px e espaçamento compacto.

A galeria usa width: min(100%, 550px, calc((100svh - 180px) / 1.08)); as cinco imagens têm tamanho uniforme, proporção 2:3 e object-fit: cover, recortando sem deformar.

Capturas do refinamento: `.impeccable/review/login-compact-desktop.jpg` (1520×728), `login-compact-mobile.jpg` (320×568) e `login-compact-short.jpg` (720×480). As três viewports ficaram sem rolagem da página; apenas 720×480 precisou de rolagem interna do formulário. A viewport reduzida continua sendo uma equivalência espacial, sem teste de zoom real. Build final passou; revisão do refinamento com disposição `ship`, sem defeito material nas três capturas. Erros locais também verificados em 320px: dois alertas corretos, sem rolagem da página.