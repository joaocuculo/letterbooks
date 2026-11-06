# Componentes básicos e Style Guide — Etapa 2

O laboratório também inclui os domínios da Etapa 3. Consulte [refactoring-stage3.md](refactoring-stage3.md) para exemplos, componentes migrados, limites e validação. Além dos checks abaixo, execute `npm run check:styleguide-isolation` para conferir os imports dos exemplos locais.

Execute `npm run dev` no frontend e abra `/styleguide`. A rota só é registrada quando `import.meta.env.DEV` é verdadeiro; o módulo é importado com `React.lazy` e tem fallback de carregamento. Não há link no menu público. Não há verificação de hostname.

O Style Guide é uma rota irmã das rotas da aplicação. O `AuthProvider` continua envolvendo todas as rotas existentes, mas não envolve o laboratório. Isso evita que uma sessão armazenada cause uma consulta de perfil ao abrir a página. O provider, seus efeitos e todas as regras de autenticação permanecem intactos. Serviços, endpoints, DTOs e regras de negócio não foram modificados.

## Componentes reais

- `Button`: variantes default, outline, secondary, ghost, link e destructive; alturas xs/sm/default/lg de 28/32/36/44 px; tamanhos de ícone equivalentes; loading com spinner, `aria-busy` e bloqueio nativo. A fórmula de hover secondary agora referencia os tokens existentes. O BookCard mantém seus controles de 38 px.
- `Input`, `Textarea` e `Select`: derivados do registro oficial shadcn Base Nova, com imports locais e tokens da Etapa 1. O Input usa Base UI. Select usa Base UI, com seleção por teclado, placeholder e disabled. Foco, erro, tipografia e estado desabilitado compartilham acabamento; campos têm fonte de 16 px em mobile para evitar zoom do navegador.
- `Dialog`: composição oficial com Root, Trigger, Portal, Overlay, Content, Header, Title, Description, Footer e Close; sem recriar foco ou teclado manualmente. Textos de fechamento traduzidos, superfícies e camadas locais.
- `DropdownMenu`, `Tooltip` e o Drawer existente continuam com Base UI; o laboratório usa esses componentes, sem duplicar suas estruturas. Movimento reduzido também é aplicado aos novos controles.
- `Feedback`: estados info, loading, error e empty, com ícones Lucide e conteúdo/ação opcionais. Loading usa status, erro usa alert. Não contém chamadas de rede ou política de retry.
- `PasswordInput` passa a reutilizar `Input`, preservando props, visibilidade, identificadores, eventos e botão do tipo button.

Fontes oficiais dos componentes incorporados: `https://ui.shadcn.com/r/styles/base-nova/{input,textarea,select,switch,toast,dialog}.json`. Ícones do registro foram substituídos por Lucide já instalado. Não foram adicionadas dependências.

## Exemplos locais

`StyleGuidePage.tsx` apresenta superfícies/tokens, tipografia, botões, campos, menu/tooltip, diálogo/drawer, feedback e BookCard. Campos, seleção, formulário, favorito, tentativa novamente e ações dos painéis usam somente estado React local. As capas SVG são fictícias e embutidas. O exemplo de livro usa `BookCardFrame`, `BookFavoriteButton`, `BookOptionsMenu` e `BookRating` reais; seus links têm navegação interceptada exclusivamente no exemplo, para não consultar um livro fictício na API.

Para ampliar o guia, adicione exemplos importando o componente real. Mantenha seus dados locais; não importe serviços, hooks de dados ou componentes que façam requisições ao montar. Não migre componentes específicos de domínio sem a aprovação da Etapa 3.

## Validação

1. `npm run build`
2. `npm run lint`
3. `npm run check:styleguide-production`

O último comando inspeciona os arquivos gerados e falha se encontrar rota, nome do módulo, marcador exclusivo, CSS ou arquivo do Style Guide no build. Deve ser executado após o build.

Verificações de navegador desta etapa: rota disponível em desenvolvimento; `/styleguide` no preview de produção apresenta o 404 existente; tamanhos dos botões medidos em 28/32/36/44 px e controles do BookCard em 38 px; seleção nativa, submissão local do formulário, menu por teclado, tooltip por foco, edição local do diálogo e retorno de foco, abertura/fechamento do Drawer, favorito local e feedback de retry. Diálogo cabe em 320 px e a página não apresenta overflow horizontal em 390 px.

O build mantém o aviso preexistente de bundle JavaScript acima de 500 kB. A validação é local, sem persistência ou exercício de contas reais. Ficam para revisão manual adicional a aparência em Safari/iOS e outros leitores de tela; selects nativos podem ter apresentações diferentes entre sistemas operacionais. A migração dos demais formulários, menus e diálogos das páginas pertence às próximas etapas.

## Atualização — Switch, toasts e feedback transitório

A seção `/styleguide#notifications` demonstra o Switch real, estados desabilitados, toast normal, confirmação de sucesso e Promise com sucesso/erro. Todos os exemplos são locais. Favoritar um BookCard do exemplo simula uma Promise e mantém a altura do card enquanto o toast mostra o progresso.

O Toaster global usa Base UI, com gerenciador separado em `components/ui/toast-manager.ts` para preservar Fast Refresh. `toast.add` apresenta mensagens comuns; `toast.promise` acompanha a mesma Promise da requisição, sem duplicá-la. As confirmações transitórias de livros, estantes, avaliações, perfil e administração deixam de ocupar espaço no conteúdo; erros de validação permanecem junto aos campos. Toasts podem ser fechados e respeitam movimento reduzido.

O Switch da estante mantém o texto à esquerda e o controle à direita. Os botões das áreas de ação dos diálogos se alinham à direita em desktop e mobile. Biblioteca e Explorar compartilham a escala de grade do catálogo. A pesquisa principal usa Enter e não apresenta botão de envio visível.

Verificações desta atualização: build, lint e ambos os scripts de isolamento passaram; Switch real conferido em modal sem salvar; pesquisa real por Enter; cards de biblioteca e Explorar medidos com a mesma largura e altura; toasts Promise de sucesso e erro testados com dados locais; guia sem overflow nas cinco larguras de referência; modal e toast conferidos em 320 px. Nenhuma gravação real foi necessária para essas verificações.

## Layout de documentação

StyleGuideLayout.tsx centraliza grupos, rótulos, descrições e navegação. Section e PreviewPanel são componentes locais ao laboratório. Sidebar sticky de 232 px em desktop; abaixo de 960 px, barra fixa durante a rolagem e Drawer Base UI com navegação por âncoras. O item ativo acompanha a rolagem via listener passivo limitado por requestAnimationFrame; aria-current indica a localização. Durante a abertura do Drawer o rastreamento fica suspenso. Há atalho para pular ao conteúdo e scroll-margin para os títulos.

Botões possuem painéis de variantes e tamanhos/estados. Formulários usam grade responsiva; menus, diálogos e outros exemplos básicos possuem superfícies delimitadas. BookCards mantêm suas proporções; tabelas mantêm rolagem interna. Nenhum componente global foi modificado para o layout.

Validação: desktop e 390 px, sidebar sticky, atualização ativa na rolagem livre de Botões para Campos, âncoras, formulário sem overflow horizontal, Drawer fechando ao selecionar uma seção e por Escape, exemplos de botão interativos e tabela com rolagem interna. Build, lint e os dois checks de isolamento passaram; o aviso de chunk acima de 500 kB permanece.
