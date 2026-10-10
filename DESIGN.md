---
name: LetterBooks — Home Diagonal e Autenticação Galeria
description: Home com capas diagonais em movimento e autenticação com galeria estática; interface em preto, branco e cinza.
colors:
  accent: "#000000"
  white: "#ffffff"
  ink: "#202323"
  muted: "#606565"
  surface: "#f5f6f5"
  accent-soft: "color-mix(in srgb, var(--accent) 9%, white)"
  review-fallback: "#ffffffed"
  review-glass: "#ffffffc7"
  review-border: "#d5d8d7"
  review-layer-front: "#ffffff80"
  review-layer-back: "#e4e6e680"
  login-input-border: "#858d89"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(40px, 4.5vw, 68px)"
    fontWeight: 750
    lineHeight: 1.08
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(38px, 4vw, 56px)"
    fontWeight: 750
    lineHeight: 1.12
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(28px, 3vw, 38px)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "15px"
    lineHeight: 1.85
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "13px"
    fontWeight: 750
  login-title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "44px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.035em"
rounded:
  pill: "999px"
  card: "16px"
  shelf: "12px"
  cover: "5px 9px 9px 5px"
  input: "10px"
spacing:
  compact: "9px"
  small: "14px"
  medium: "24px"
  card: "28px"
  column-mobile: "35px"
  column: "90px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "17px 24px"
    typography: "{typography.label}"
  button-primary-small:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "12px 19px"
  review-card:
    backgroundColor: "{colors.review-fallback}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "21px 23px"
  review-card-hero-glass:
    backgroundColor: "{colors.review-glass}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "21px 23px"
  library-preview:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "28px"
  login-input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.input}"
    padding: "9px 13px"
---

# Design System: LetterBooks

## Overview

**Creative North Star: "Um lugar para cada leitura — Diagonal"**

Este documento registra a Home Diagonal aprovada pelo usuário, extraída de `frontend/src/styles/home.css`, `frontend/src/pages/HomePage.tsx` e `frontend/src/data/homeBooks.ts`. A interface usa preto, branco e cinza fixos, Manrope local, títulos densos e capas reais como matéria visual principal. As capas preservam as cores das edições; não constituem cores de destaque da interface.

O conteúdo em português apresenta organização e avaliação de livros com demonstrações identificadas. A identidade aprovada abrange a Home Diagonal, autenticação, recuperação/redefinição de senha, Perfil e Explorar. `/explore` unifica descoberta e pesquisa; as demais páginas preservam seu estilo até uma migração solicitada. Login e cadastro estendem a identidade com formulário simples e cinco capas estáticas. Recuperação de senha usa formulário central e capas em escada cortadas nas bordas; a redefinição compartilha essa composição. A comparação entre modelos e o seletor de cores foram encerrados.

**Key Characteristics:**
- Home Diagonal aprovada, com interface em preto, branco e cinza fixos.
- Capas protagonistas em seis colunas diagonais exclusivas, com movimento contínuo lento e controlável.
- Fade contínuo em toda a altura do hero desktop e avaliação em vidro translúcido.
- Avaliações ilustrativas e prévias explicitamente identificadas.
- Identidade aplicada à Home, autenticação, recuperação/redefinição, Perfil e Explorar, com composições próprias por superfície.

## Colors

### Primary

Preto é o destaque fixo dos botões, ponto da marca, palavras enfatizadas, notas e status selecionado. O texto das ações principais é branco. Não há personalização de cor, contraste calculado por escolha de usuário ou paletas por modelo.

**The Fixed Palette Rule.** Preservar preto, branco e cinza na interface da Home; as cores das capas pertencem aos assets.

### Neutral

Branco sustenta a página e a área de leitura revelada pelo fade das capas. Tinta principal estrutura títulos, navegação e foco; cinza secundário sustenta parágrafos e metadados. A superfície quase branca agrupa a demonstração da biblioteca. O fundo suave mistura 9% do preto com branco. Avaliações usam branco translúcido, borda cinza fina e duas camadas neutras; os valores normativos estão no frontmatter.

As contingências textuais das capas mantêm os fundos de edição implementados (`#244b48`, `#c26541`, `#d0b65a`, `#26395c`); são tratamento das capas, não uma paleta de controles.

## Typography

Explorar reutiliza Manrope local. O título da descoberta varia entre 30px e 44px, com peso 800 e entrelinha 1.2; resultados usam 24px (20px em até 479px). Títulos das seções usam 25px; títulos dos livros, 16px com entrelinha 1.4; autores e metadados, 13px com entrelinha 1.6. Esses tamanhos pertencem à superfície, sem substituir a hierarquia da Home.

Manrope é uma fonte variável local (`/fonts/Manrope.ttf`, pesos 200–800, `font-display: swap`), com fallback sans-serif. A mesma família cobre títulos, corpo e controles. A exceção é a capa textual de contingência: Georgia para título e Manrope para autor.

A hierarquia base está no frontmatter. Os parágrafos principais têm largura máxima de 390px. Textos secundários usam 13px e entrelinha de 1.8–1.9; metadados variam entre 9px e 11px. Títulos têm espaçamento negativo e quebra balanceada. No celular, o título principal usa `clamp(38px, 8vw, 60px)` e o parágrafo do hero usa 13px, entrelinha 1.8 e largura máxima de 360px.

Login e cadastro usam a mesma Manrope local: título de 44px (38px até 480px de largura; 32px até 650px de altura), descrição de 14px com entrelinha 1.8, rótulos de 13px e campos de 16px.

## Layout

Cabeçalho e rodapé têm largura máxima de 1440px e padding horizontal proporcional de 5.5%. O cabeçalho tem 68px de altura no desktop. O hero chega a 1600px e tem altura mínima de 730px; o conteúdo inferior chega a 1160px, com padding lateral de 40px. As seções de biblioteca e avaliação usam duas colunas alternadas, intervalo de 90px e bastante espaço vertical.

As capas ficam à esquerda em seis colunas giradas a −32°, recortadas e dissolvidas em branco. A grade preenche também a região triangular inferior esquerda. Sua origem fica em −720px no desktop, −790px até 1100px e −646px no celular. No desktop, a largura do campo é 85% do hero mais a sangria `max(0px, (100vw - 1600px) / 2)`, e a posição compensa essa sangria para levar as capas à borda da viewport mesmo quando o hero centralizado para de crescer. O texto começa em 54% da largura do hero, seguido pela pilha de avaliações. As colunas têm 155px de largura e intervalo de 25px; as pares recebem deslocamento inicial de 120px. Máscaras vertical e horizontal se intersectam: a primeira preserva o centro entre 80px do topo e 120px da base; a segunda dissolve as capas da esquerda para a direita em uma faixa contínua por toda a altura do hero, com `linear-gradient(to right, black 40%, #0008 50%, #0001 62%, transparent 74%)`. Um gradiente branco de 120px integra a base ao restante da página.

Em até 1100px, o texto começa em 52%, o hero tem mínimo de 700px e os intervalos das seções diminuem para 50px. Em até 760px, as seções passam a uma coluna e o padding principal cai a 26px. O cabeçalho móvel ocupa duas linhas, tem altura automática e mínimo de 88px: marca e conta ficam acima; Explorar fica abaixo. Entrar continua visível para visitantes; Como funciona fica oculto.

No celular, o texto fica acima da composição de capas, com padding inferior de 300px. O campo de capas ocupa os 490px inferiores, com máscara vertical transparente nas extremidades e centro preservado entre 25% e 70%. As colunas diminuem para 125px e os intervalos para 18px. O rodapé não reserva espaço para painel de comparação.

No modelo Galeria de login e cadastro, a página tem altura mínima de 100svh e cresce naturalmente quando o conteúdo não cabe. O cabeçalho de 68px contém somente marca e “Voltar ao início”; até 650px de altura, reduz para 56px. O conteúdo chega a 1280px; no desktop, formulário de até 350px à esquerda e galeria à direita. Espaços menores e padding de 20px no topo e 24px na base posicionam o bloco mais acima. A galeria fica oculta abaixo de 1024px, com formulário centralizado. O formulário não possui rolagem interna nem altura máxima. Em janelas muito baixas, estados com erros ou teclado aberto, somente a página rola, mantendo todos os campos e ações acessíveis. Não há card externo, menu principal ou rodapé nessa página.

## Elevation & Depth

Explorar usa composição plana, com separação por espaço e linhas neutras. A página não replica as sombras, rotações ou vidro do hero. As capas conservam a imagem inteira com `object-fit: contain` dentro da proporção 2:3.

A página é majoritariamente plana; a profundidade está nas capas, na pilha de avaliações e no menu de conta. Capas recebem sombra `2px 7px 14px #18232224` e uma faixa de luz/sombra que sugere lombada. Avaliações usam `0 7px 28px #20232312`, borda de 1px e duas camadas giradas a 3° e 5°. O menu usa `0 12px 30px #20232320`.

O fade horizontal das capas forma uma faixa vertical contínua no desktop. Não há pseudoelemento branco, recorte ou sombras brancas ao redor do título, subtítulo e ações. Os fades superior e inferior e a máscara móvel permanecem.

O cartão de avaliação tem fundo branco de contingência. Somente no hero, quando `backdrop-filter` ou `-webkit-backdrop-filter` é suportado, usa o branco mais translúcido do token de vidro com desfoque de 14px. A avaliação da seção inferior mantém a contingência sem desfoque. Os controles do hero têm proteção branca própria (`#fffffff0`).

As cinco capas estáticas do login usam sombra `3px 12px 22px #20232320`; o formulário permanece plano. São assets locais reutilizados, com os registros de origem existentes preservados.

## Shapes

Em Explorar, capas têm cantos de 8px, busca de 12px e campos de filtro de 10px. Ações principais mantêm a cápsula preta. O seletor de visualização tem borda neutra e cantos de 10px; a opção ativa usa tinta principal e ícone branco.

Botões principais são cápsulas; cartões e painéis têm cantos suaves. Capas preservam proporção 2:3, recorte da imagem e cantos assimétricos que lembram um livro. Avatares de iniciais e controles de avaliação são circulares. As rotações pertencem à composição de capas e à pilha de avaliações; os blocos de leitura permanecem alinhados.

## Components

### Buttons

A ação principal é uma cápsula preta com texto branco e seta SVG. Hover acrescenta sombra `0 5px 14px #20232320`, com transição de box-shadow em 0.2s ease. A ação secundária é um link de texto com seta e sublinhado no hover. Todos os elementos focáveis na Home recebem contorno de 3px na tinta principal, afastado 5px. O link de pular conteúdo aparece ao receber foco.

### Cards / Containers

A pilha de avaliações tem avatar de iniciais, nome, livro, nota e comentário. Anterior/próxima percorrem três exemplos por ação manual; a região usa anúncio educado e atômico. O rótulo “Avaliações ilustrativas” permanece visível. A biblioteca é uma demonstração rotulada “Exemplo de organização”; seus status e capas não são controles funcionais.

### Chips

Os exemplos de estantes usam fundo suave, cantos de 12px e padding de 18px 24px. São elementos ilustrativos sem ação. O texto que informa que a interface está em desenvolvimento faz parte da apresentação.

### Navigation

SiteHeader compartilhado pela Home, Perfil e Explorar, com marca, link único Explorar, Como funciona e ações conforme autenticação. Explorar substitui o antigo link Pesquisar e leva à descoberta e pesquisa em `/explore`; `/search` redireciona preservando query e fragmento. Visitantes têm Entrar e Criar conta; pessoas autenticadas seguem para Meus livros e têm menu de conta. Login e cadastro compartilham cabeçalho próprio com marca e voltar ao início; recuperação usa o cabeçalho de autenticação e capas em escada.

### Explorar — extensão aprovada

Descoberta apresenta introdução e busca centralizadas, pesquisa avançada em drawer e grades completas de até doze livros por seção. Pesquisa submetida move a busca para o topo dispõe resultados em toda a largura e mantém os filtros ocultos em um drawer à direita, aberto pelo ícone SlidersHorizontal dentro da busca. O conteúdo chega a 1280px, com padding de 64px 48px 80px; abaixo de 1024px usa 40px 28px 64px e abaixo de 480px, 32px 20px 56px. Grade compacta tem quatro colunas no desktop, duas no tablet e uma no celular estreito; detalhada tem duas no desktop e uma abaixo de 1024px. Cada item detalhado dispõe capa e texto lado a lado, com editora e data adicionais. O seletor usa `aria-pressed` e altera apenas a apresentação, sem consultar a API.

Campos de filtro têm rótulo visível, borda neutra e altura de 44px; busca mostra foco no contêiner e as ações mantêm área mínima de 44px. O disclosure nativo permite abrir/fechar filtros por teclado, inclusive durante pesquisa. Termo e filtros só são aplicados por envio; Limpar filtros conserva o termo aplicado, enquanto Limpar pesquisa retorna à descoberta. A URL registra termo, filtros e página. Pesquisa solicita vinte livros por página e oferece Anterior/Próxima quando existem outras páginas.

Título e capa abrem detalhes; capa ausente ou quebrada mostra “Capa indisponível”, mantendo o acesso ao livro. Favoritar expõe estado pressionado e desabilita a ação durante o salvamento. Visitantes seguem ao login com retorno à URL atual. Carregamento e vazio usam anúncio de estado; erros usam `role="alert"` e vermelho #b42318, herdado da autenticação e do Perfil. Falha de carregamento oferece Tentar novamente. Contrato, evidências e limites de validação: `.impeccable/explore-brief.md` e `docs/explore.md`.

### Detalhes do livro — extensão aprovada

`/books/:googleBooksId` reutiliza SiteHeader, Manrope compacta e a paleta neutra; a capa conserva sua cor e imagem inteira. Conteúdo até 1120px, título de 28–36px, seções de 19px e corpo de 14px; sinopse com entrelinha 1.85 e medida de até 70ch. Biblioteca é a composição consolidada, com capa/ações em lateral de 240px e leitura à direita, sticky somente quando a lateral mais 48px cabe na altura. A comparação com Apresentação e Editorial foi encerrada. Esta composição pertence à superfície de detalhes, sem impor seu layout às demais páginas.

Abaixo de 1024px, Biblioteca empilha identificação, capa, ações, sinopse, edição e opiniões. Padding de 32px 40px 72px no desktop, 24px 28px 56px abaixo de 1024px e 20px 20px 48px abaixo de 480px; somente a página rola. A capa tem cantos de 5px e sombra discreta `3px 10px 12px #20232320`; ausência/falha mostra “Capa indisponível” em superfície neutra. Clicar na capa abre lightbox escuro com a mesma imagem, fechamento por Escape, clique fora ou botão e retorno do foco; ampliar não melhora a qualidade da fonte.

A ação principal mantém cápsula preta; favorito usa botão neutro com estado pressionado. Campos têm cantos de 10px, ações/controles têm altura mínima de 44px e campos usam texto de 16px abaixo de 1024px. Avaliação abre inline com foco na nota selecionada, inclusive zero; estrelas oferecem prévia no hover e seleção por radios nativos, com opção explícita “Sem estrelas”. Salvar/cancelar devolvem foco à região de avaliação. Cartões de avaliações usam cinza suave e cantos arredondados; somente a própria avaliação tem menu de reticências com Editar/Excluir. Excluir usa vermelho existente e diálogo de confirmação. Abaixo da edição, “Na sua biblioteca” apresenta agrupamentos de leitura e estantes personalizadas como nomes sem links e fica oculto sem associações. Mensagens de erro usam vermelho existente e `role="alert"`; carregamentos/sucesso usam `role="status"`. Contrato, capturas ilustrativas e limites de verificação: `.impeccable/book-details-brief.md` e `docs/book-details.md`.

### Login e Cadastro Galeria

Campos brancos com borda neutra (`login-input-border`), cantos de 10px e altura mínima de 44px; foco com borda e contorno na tinta principal. Erros usam borda tracejada, `aria-invalid`, descrição associada e anúncio `role="alert"`; mensagens de sucesso usam `role="status"`. A ação preta em cápsula também tem mínimo de 44px. Durante o envio, formulário informa `aria-busy`, campos e botão ficam desabilitados e a ação mostra “Entrando...”. Link de pular conteúdo e foco visível atendem navegação por teclado.

À direita ficam Água viva, Noites brancas, Duna, O hobbit e Orgulho e preconceito, com uma capa central alta e quatro ao redor, sem movimento. Todas têm o mesmo tamanho e proporção 2:3, com object-fit: cover para recortar sem deformar; a galeria dimensiona a largura por min(100%, 550px, calc((100svh - 180px) / 1.08)). A composição é decorativa (`aria-hidden`, imagens com `alt=""`) e usa os cinco JPEGs locais por ISBN. Autenticação, feedback, recuperação, cadastro e destino interno após `signIn` permanecem preservados, inclusive query string e fragmento.

O layout compartilhado AuthGalleryLayout reúne cabeçalho, conteúdo e galeria idênticos, usando o CSS do login compacto. A rota /register usa esse layout diretamente, sem o AppLayout anterior. Cadastro contém Nome, E-mail, Senha e Confirme sua senha; preserva o endpoint, autocomplete e link para entrar. A senha mostra somente a primeira exigência pendente em vermelho (#b42318) abaixo do campo, atualizada durante a digitação e associada por aria-describedby. A mensagem desaparece quando a senha é válida; o campo vazio inicial não mostra erro antes do envio. As regras permanecem: 8 a 72 unidades UTF-16, letra maiúscula Unicode, letra minúscula Unicode, número ASCII e pontuação ou símbolo Unicode. Não há lista de requisitos. A confirmação é obrigatória e deve coincidir; o limite adicional de 72 bytes UTF-8 evita exceder BCrypt e mostra mensagem de senha muito longa. Durante o envio, mostra “Cadastrando...”; o sucesso usa o JWT recebido para entrar automaticamente e redirecionar para a Home, limpando os dois campos de senha. Erros de campo/API usam role="alert" e associação ao campo.

### Capas e movimento

Assets locais em `/images/books/` correspondem a edições em português e inglês; títulos e autores apresentados estão em português. O catálogo explícito do hero em `frontend/src/data/homeBooks.ts` distribui 36 obras em seis colunas de seis obras exclusivas: uma obra não aparece em outra coluna. Preservar o sidecar de origem dos assets. Os seis ISBNs fornecidos pelo usuário estão presentes: `9788582852477`, `9786555320213`, `9788573263350`, `9788544002193`, `9786555320350` e `9786580210008` — Memórias do subsolo, Água viva, Noites brancas, Os irmãos Karamázov, A hora da estrela e A metamorfose, respectivamente. Capas decorativas no hero ficam fora da árvore acessível; capas na demonstração recebem título e autor. Falha de imagem mostra a contingência textual, sem depender da API de descoberta.

Cada uma das seis colunas contém dois grupos iguais; cada grupo tem 12 capas, formadas pelas seis obras da coluna repetidas duas vezes. O trilho percorre −50% da própria altura em 144s, linear e infinitamente; colunas pares invertem o sentido. A distância por ciclo cresceu em proporção de 12/8, enquanto a duração cresceu de 48s para 144s: a velocidade linear é metade da versão anterior. A repetição de grupos e o padding inferior igual ao intervalo mantêm a emenda do ciclo. Pausar/Retomar movimento controla a pausa manual e expõe `aria-pressed`.

O movimento também pausa quando o hero sai da viewport ou quando o documento fica oculto. A preferência de movimento reduzido é acompanhada em tempo real, remove animações, transições e rolagem suave da Home e oculta o controle de movimento. A navegação das avaliações continua manual.

## Do's and Don'ts

### Do:
- **Do** preservar a Home Diagonal aprovada e a paleta fixa de preto, branco e cinza.
- **Do** manter foco visível, pausa manual, pausa fora da viewport e respeito a movimento reduzido.
- **Do** preservar o fade contínuo do hero desktop e o vidro com contingência sem desfoque.
- **Do** identificar avaliações ilustrativas e recursos cuja interface está pendente.
- **Do** preservar assets locais e seus registros de origem.
- **Do** preservar as extensões aprovadas de autenticação, recuperação/redefinição, Perfil e Explorar; outras páginas aguardam migração solicitada.

### Don't:
- **Don't** reintroduzir comparação de modelos ou seletor de cores na Home.
- **Don't** substituir a escada de capas da recuperação pela Galeria de login e cadastro.
- **Don't** apresentar exemplos como depoimentos reais, métricas ou funcionalidades prontas.
- **Don't** substituir capas reais por imagens geradas sem uma decisão explícita.
- **Don't** estender o estilo automaticamente às páginas que mantêm o sistema anterior.

Os dois campos de senha do cadastro usam PasswordInput com botão de olho independente, tipo button, rótulo acessível Mostrar/Ocultar e aria-controls. Ambos iniciam ocultos, preservam valor e autocomplete ao alternar e desabilitam o controle durante envio. Ícone SVG neutro com área de toque de 44px e foco visível; sem novas dependências.

Validações por campo e mensagens de erro da API nos formulários de login e cadastro usam vermelho #b42318, por seletores role=alert no CSS compartilhado. Mensagens de sucesso role=status preservam seu estilo.

## Recuperação de senha — Escada

/forgot-password reutiliza AuthGalleryLayout com variant=recovery. Formulário até 350px centralizado horizontalmente na página, título e descrição centralizados e campos/mensagens alinhados à esquerda. Cabeçalho compartilhado, sem menu principal ou rodapé. Dez capas locais distintas ficam em quatro colunas com 1, 2, 3 e 4 imagens, sem rotação ou movimento; proporção 2:3, gap de 12px e sombra suave. Metade da última coluna e da fileira inferior transborda além das bordas, recortada em uma camada decorativa com overflow:hidden e pointer-events:none. A largura das capas acompanha a largura e altura da viewport para preservar o formulário. Abaixo de 1024px, a decoração é ocultada. Somente a página pode rolar em alturas insuficientes; não há rolagem interna. POST /auth/forgot-password, mensagens da API e fluxo atual preservados; /reset-password também utiliza essa composição, preservando token, validação e retorno ao login.


Ícones da interface usam lucide-react, instalado pelo npm para React/Vite, com imports nomeados e tamanhos/espessuras preservados. PasswordInput compartilha Eye/EyeOff entre login, cadastro e redefinição. Cadastro e reset usam getPasswordError compartilhado, exibindo uma exigência pendente em vermelho, sem lista. Reset exige as mesmas regras do cadastro: 8–72 caracteres, maiúscula, minúscula, número e caractere especial, além do limite de 72 bytes UTF-8 do BCrypt. Sem mudança de API ou de entrada após cadastro.

## Perfil — extensão aprovada

`/profile` estende a identidade neutra da Home e da autenticação, com Manrope local, fundo branco e o SiteHeader compartilhado de 68px. O conteúdo tem largura máxima de 1120px e título entre 30px e 40px; no desktop, resumo de conta de 300px à esquerda e formulários à direita, separados por 80px. O resumo usa fundo suave, borda neutra, cantos de 16px e avatar circular de iniciais de 80px. Nome, e-mail, tipo, situação e data de cadastro são dados da conta; não há estatísticas ou upload de foto. Dados pessoais e Alterar senha aparecem em sequência, separados por uma linha fina, sem cartões externos.

Abaixo de 1024px, resumo e formulários formam uma coluna de até 680px; abaixo de 481px, os metadados também empilham e os botões ocupam toda a largura. A página cresce e rola naturalmente. Campos compartilham a altura mínima de 44px, cantos de 10px, foco escuro e borda tracejada de erro da autenticação; ações usam cápsula preta. PasswordInput mantém olhos independentes com área de toque de 44px. Erros de campo e API usam vermelho e `role="alert"`, associados por `aria-describedby`; sucesso e carregamento usam `role="status"`. A nova senha exibe somente a primeira exigência pendente, sem lista. O cabeçalho, link de pular conteúdo e foco visível preservam o acesso por teclado. Esta extensão autoriza o Perfil; outras páginas conservam seu sistema até migração solicitada. Evidência e fluxos: `.impeccable/profile-brief.md`.

### Refinamento do campo Explorar

O campo principal é uma cápsula com ação Pesquisar interna à direita, fundo branco, borda #d5d8d7 e sombra suave 0 3px 10px #20232314. O botão mantém preto e altura mínima de 44px. Em 320px, o ícone decorativo é ocultado e espaçamentos reduzidos para preservar campo e ação na mesma linha. Descoberta solicita até 12 livros por seção para preencher três fileiras de quatro no desktop; pesquisa continua com 20 por página.

### Pesquisa avançada em drawer

Em Explorar, o controle SlidersHorizontal fica à esquerda de Pesquisar, sem borda e com fundo neutro no hover. O drawer lateral usa branco, Manrope, título de 22px, rótulos de 13px e campos de 44px; largura máxima de 400px, adaptada à tela. Base UI fornece foco modal e fechamento por Escape/clique fora. Transições respeitam movimento reduzido. Filtros não ocupam coluna na grade.

### Escala compacta — 2026-10-10

As páginas com identidade Manrope usam texto base de 14px. Campos têm texto de 14px no desktop e 16px abaixo de 760px, preservando altura mínima de 44px e evitando zoom automático ao digitar no celular. Títulos: Home 34–56px (32–48px no celular), Explorar 26–36px, acesso 36px (32px no celular e 28px em telas baixas), Perfil 26–34px. Rótulos e textos auxiliares já pequenos foram preservados. O hero desktop passa a 650px mínimos; o conteúdo de Explorar chega a 1120px, com capas de até 180px e metadados alinhados à capa. Espaços entre seções e ações foram reduzidos mantendo a composição aprovada. Revisão visual com dados simulados em desktop e 320px, sem overflow horizontal em Explorar, cadastro e Perfil.

Ajuste da Home: bloco de texto, ações e avaliações deslocado para 59% da largura no desktop, com largura de 41%; em telas intermediárias inicia em 55%. Celular mantém margem zero e largura automática.
