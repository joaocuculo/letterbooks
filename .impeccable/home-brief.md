# Home: Diagonal aprovada

Modo Persuade. O visitante deve entender que pode organizar, avaliar e encontrar livros e seguir para cadastro, biblioteca ou descoberta. A direção escolhida pelo usuário é Diagonal com interface em preto, branco e cinza fixos. A comparação entre modelos e o seletor de cores foram encerrados.

## Direction contract

THESIS: mostrar a relação pessoal com livros; capas reais são a principal matéria visual.

OWN-WORLD: base branca, Manrope, tinta #202323, cinza #606565 e controles pretos com texto branco. Capas preservam suas cores de edição. Cartões de avaliação usam profundidade suave e sobreposição; no hero, vidro branco #ffffffc7 com blur de 14px quando suportado e fundo #ffffffed de contingência.

STORY: entender a proposta, ver demonstrações honestamente identificadas, criar conta ou explorar livros. Textos e destinos existentes permanecem: visitantes seguem para /register, autenticados para /my-books, descoberta para /explore e busca para /search.

FIRST VIEWPORT: capas recortadas à esquerda em seis colunas a −32°, cobrindo também o triângulo inferior esquerdo, texto e avaliação à direita. Cabeçalho de 68px no desktop; no celular, altura automática com mínimo de 88px e navegação em segunda linha. Máscaras e gradiente branco integram as capas à página. O fade horizontal ocupa toda a altura do hero desktop em faixa vertical contínua: black 40%, #0008 50%, #0001 62%, transparente 74%. Título, subtítulo e ações não recebem pseudoelemento, recorte ou sombra branca próprios. Os fades superior/inferior e mobile permanecem. Celular coloca texto/avaliação acima da composição de capas.

FORM: Diagonal é a única composição da Home. Catálogo explícito em frontend/src/data/homeBooks.ts: 36 obras, seis colunas com seis obras exclusivas por coluna, sem compartilhamento entre colunas. Cada trilho tem dois grupos iguais de 12 capas; cada grupo repete as seis obras duas vezes. Ciclo linear de 144s em sentidos alternados, com metade da velocidade linear da versão anterior de oito capas por grupo em 48s. Pausa manual, fora da viewport e com documento oculto; movimento reduzido desativa animações e oculta o controle. Avaliações têm navegação manual anterior/próxima.

FINISH: revisão e documentação devem refletir o código entregue; capas locais mantêm sua proveniência. Não declarar detector ou validação visual executados sem evidência.

## Limites

Não alterar backend, autenticação ou regras de negócio. A Home de descoberta existente permanece em /explore. Prévia de estantes deve declarar interface pendente. Assets locais de edições em português e inglês, com origem documentada em sidecars; não fabricar avaliações reais. Galeria está reservada para login/cadastro em trabalho futuro; essas páginas não foram alteradas. Não reintroduzir Foco, modelos comparáveis ou controles de cor na Home.

## Execução

O launcher da skill falhou no Windows (cache_directory_failed). Contexto lido diretamente; nenhum detector foi executado. A documentação foi extraída de frontend/src/pages/HomePage.tsx, frontend/src/styles/home.css e frontend/src/data/homeBooks.ts.

Revisão histórica da consolidação anterior: disposition ship, limitada àquela versão; não constitui veredito do refinamento atual. Evidências em .impeccable/review/diagonal-final-{desktop,tablet,mobile,small-mobile}.jpg, nos viewports 1440x960, 820x1180, 390x844 e 320x740. Capturas diagonal-auth-desktop.jpg e diagonal-auth-mobile.jpg usam um AuthContext ilustrativo, sem login real. Build e lint passaram; navegação de avaliações por teclado, pausa manual e pausa fora da viewport conferidas no navegador. Movimento observado em amostras ao longo de 59 segundos; screenshots não medem fluidez contínua. Documento oculto e movimento reduzido conferidos no código, sem simulação no navegador. Capturas antigas de comparação não são a evidência desta revisão.

## Refinamento atual: preenchimento e curadoria

O usuário pediu preenchimento do triângulo inferior esquerdo, movimento mais lento e obras exclusivas por coluna. A grade usa left −720px no desktop, −790px até 1100px e −646px no celular; a sangria da viewport mantém capas até a borda quando o hero centralizado atinge 1600px. Cabeçalho 68px/88px, vidro de 14px, paleta monocromática e textos permanecem.

Os seis ISBNs fornecidos estão no catálogo e possuem imagens locais: 9788582852477, 9786555320213, 9788573263350, 9788544002193, 9786555320350 e 9786580210008. Foram acrescentadas 26 imagens locais com sidecars de origem/ISBN. A exclusividade é por obra/coluna; as repetições dentro de uma coluna sustentam o ciclo contínuo.

Evidências desta versão: .impeccable/review/curated-{wide,desktop,tablet,mobile,small-mobile}.jpg, com larguras de 1900, 1440, 820, 390 e 320px. Revisão independente: disposition ship para esta extensão da Home. Build e lint passaram; verificação do catálogo confirmou 36 ISBNs e títulos distintos, seis obras por coluna, arquivos locais e proveniência. Todas as 144 instâncias decorativas estavam carregadas nas capturas; não há rolagem horizontal. As capturas registram estados estáticos; não comprovam fluidez contínua.

## Refinamento do fade

Decisão do usuário: transição vertical contínua em toda a altura do hero desktop, sem proteção branca recortada ao redor da introdução. A máscara horizontal usa linear-gradient(to right, black 40%, #0008 50%, #0001 62%, transparent 74%). Evidências desta alteração em .impeccable/review/fade-desktop.jpg e .impeccable/review/fade-mobile.jpg.
