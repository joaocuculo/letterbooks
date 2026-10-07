---
name: LetterBooks — Home Diagonal
description: Home aprovada com capas diagonais em movimento e interface em preto, branco e cinza.
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
rounded:
  pill: "999px"
  card: "16px"
  shelf: "12px"
  cover: "5px 9px 9px 5px"
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
---

# Design System: LetterBooks

## Overview

**Creative North Star: "Um lugar para cada leitura — Diagonal"**

Este documento registra a Home Diagonal aprovada pelo usuário, extraída de `frontend/src/styles/home.css`, `frontend/src/pages/HomePage.tsx` e `frontend/src/data/homeBooks.ts`. A interface usa preto, branco e cinza fixos, Manrope local, títulos densos e capas reais como matéria visual principal. As capas preservam as cores das edições; não constituem cores de destaque da interface.

O conteúdo em português apresenta organização e avaliação de livros com demonstrações identificadas. O sistema está restrito à Home: outras páginas preservam o estilo anterior; `/explore` contém a antiga Home de descoberta. Galeria fica reservada para um futuro trabalho em login/cadastro; essas páginas não foram alteradas. A comparação entre modelos e o seletor de cores foram encerrados.

**Key Characteristics:**
- Home Diagonal aprovada, com interface em preto, branco e cinza fixos.
- Capas protagonistas em seis colunas diagonais exclusivas, com movimento contínuo lento e controlável.
- Fade contínuo em toda a altura do hero desktop e avaliação em vidro translúcido.
- Avaliações ilustrativas e prévias explicitamente identificadas.
- Sistema aplicado somente à Home.

## Colors

### Primary

Preto é o destaque fixo dos botões, ponto da marca, palavras enfatizadas, notas e status selecionado. O texto das ações principais é branco. Não há personalização de cor, contraste calculado por escolha de usuário ou paletas por modelo.

**The Fixed Palette Rule.** Preservar preto, branco e cinza na interface da Home; as cores das capas pertencem aos assets.

### Neutral

Branco sustenta a página e a área de leitura revelada pelo fade das capas. Tinta principal estrutura títulos, navegação e foco; cinza secundário sustenta parágrafos e metadados. A superfície quase branca agrupa a demonstração da biblioteca. O fundo suave mistura 9% do preto com branco. Avaliações usam branco translúcido, borda cinza fina e duas camadas neutras; os valores normativos estão no frontmatter.

As contingências textuais das capas mantêm os fundos de edição implementados (`#244b48`, `#c26541`, `#d0b65a`, `#26395c`); são tratamento das capas, não uma paleta de controles.

## Typography

Manrope é uma fonte variável local (`/fonts/Manrope.ttf`, pesos 200–800, `font-display: swap`), com fallback sans-serif. A mesma família cobre títulos, corpo e controles. A exceção é a capa textual de contingência: Georgia para título e Manrope para autor.

A hierarquia base está no frontmatter. Os parágrafos principais têm largura máxima de 390px. Textos secundários usam 13px e entrelinha de 1.8–1.9; metadados variam entre 9px e 11px. Títulos têm espaçamento negativo e quebra balanceada. No celular, o título principal usa `clamp(38px, 8vw, 60px)` e o parágrafo do hero usa 13px, entrelinha 1.8 e largura máxima de 360px.

## Layout

Cabeçalho e rodapé têm largura máxima de 1440px e padding horizontal proporcional de 5.5%. O cabeçalho tem 68px de altura no desktop. O hero chega a 1600px e tem altura mínima de 730px; o conteúdo inferior chega a 1160px, com padding lateral de 40px. As seções de biblioteca e avaliação usam duas colunas alternadas, intervalo de 90px e bastante espaço vertical.

As capas ficam à esquerda em seis colunas giradas a −32°, recortadas e dissolvidas em branco. A grade preenche também a região triangular inferior esquerda. Sua origem fica em −720px no desktop, −790px até 1100px e −646px no celular. No desktop, a largura do campo é 85% do hero mais a sangria `max(0px, (100vw - 1600px) / 2)`, e a posição compensa essa sangria para levar as capas à borda da viewport mesmo quando o hero centralizado para de crescer. O texto começa em 54% da largura do hero, seguido pela pilha de avaliações. As colunas têm 155px de largura e intervalo de 25px; as pares recebem deslocamento inicial de 120px. Máscaras vertical e horizontal se intersectam: a primeira preserva o centro entre 80px do topo e 120px da base; a segunda dissolve as capas da esquerda para a direita em uma faixa contínua por toda a altura do hero, com `linear-gradient(to right, black 40%, #0008 50%, #0001 62%, transparent 74%)`. Um gradiente branco de 120px integra a base ao restante da página.

Em até 1100px, o texto começa em 52%, o hero tem mínimo de 700px e os intervalos das seções diminuem para 50px. Em até 760px, as seções passam a uma coluna e o padding principal cai a 26px. O cabeçalho móvel ocupa duas linhas, tem altura automática e mínimo de 88px: marca e conta ficam acima; Explorar e Pesquisar ficam abaixo. Entrar continua visível para visitantes; Como funciona fica oculto.

No celular, o texto fica acima da composição de capas, com padding inferior de 300px. O campo de capas ocupa os 490px inferiores, com máscara vertical transparente nas extremidades e centro preservado entre 25% e 70%. As colunas diminuem para 125px e os intervalos para 18px. O rodapé não reserva espaço para painel de comparação.

## Elevation & Depth

A página é majoritariamente plana; a profundidade está nas capas, na pilha de avaliações e no menu de conta. Capas recebem sombra `2px 7px 14px #18232224` e uma faixa de luz/sombra que sugere lombada. Avaliações usam `0 7px 28px #20232312`, borda de 1px e duas camadas giradas a 3° e 5°. O menu usa `0 12px 30px #20232320`.

O fade horizontal das capas forma uma faixa vertical contínua no desktop. Não há pseudoelemento branco, recorte ou sombras brancas ao redor do título, subtítulo e ações. Os fades superior e inferior e a máscara móvel permanecem.

O cartão de avaliação tem fundo branco de contingência. Somente no hero, quando `backdrop-filter` ou `-webkit-backdrop-filter` é suportado, usa o branco mais translúcido do token de vidro com desfoque de 14px. A avaliação da seção inferior mantém a contingência sem desfoque. Os controles do hero têm proteção branca própria (`#fffffff0`).

## Shapes

Botões principais são cápsulas; cartões e painéis têm cantos suaves. Capas preservam proporção 2:3, recorte da imagem e cantos assimétricos que lembram um livro. Avatares de iniciais e controles de avaliação são circulares. As rotações pertencem à composição de capas e à pilha de avaliações; os blocos de leitura permanecem alinhados.

## Components

### Buttons

A ação principal é uma cápsula preta com texto branco e seta SVG. Hover acrescenta sombra `0 5px 14px #20232320`, com transição de box-shadow em 0.2s ease. A ação secundária é um link de texto com seta e sublinhado no hover. Todos os elementos focáveis na Home recebem contorno de 3px na tinta principal, afastado 5px. O link de pular conteúdo aparece ao receber foco.

### Cards / Containers

A pilha de avaliações tem avatar de iniciais, nome, livro, nota e comentário. Anterior/próxima percorrem três exemplos por ação manual; a região usa anúncio educado e atômico. O rótulo “Avaliações ilustrativas” permanece visível. A biblioteca é uma demonstração rotulada “Exemplo de organização”; seus status e capas não são controles funcionais.

### Chips

Os exemplos de estantes usam fundo suave, cantos de 12px e padding de 18px 24px. São elementos ilustrativos sem ação. O texto que informa que a interface está em desenvolvimento faz parte da apresentação.

### Navigation

Cabeçalho com marca, Explorar, Pesquisar, Como funciona e ações conforme autenticação. Visitantes seguem para cadastro; pessoas autenticadas seguem para biblioteca e têm menu de conta. A descoberta anterior continua em `/explore`. Login e cadastro mantêm as páginas existentes; Galeria é uma direção reservada para trabalho futuro nelas.

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
- **Do** limitar este sistema à Home enquanto a migração das outras páginas não for solicitada.

### Don't:
- **Don't** reintroduzir comparação de modelos ou seletor de cores na Home.
- **Don't** aplicar Galeria a login/cadastro sem um trabalho específico nessas páginas.
- **Don't** apresentar exemplos como depoimentos reais, métricas ou funcionalidades prontas.
- **Don't** substituir capas reais por imagens geradas sem uma decisão explícita.
- **Don't** estender o estilo automaticamente às páginas que mantêm o sistema anterior.
