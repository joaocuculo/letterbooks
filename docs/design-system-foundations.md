# Fundamentos visuais — Etapa 1

A identidade atual do LetterBooks é monocromática: branco, preto e cinzas. As capas fornecem a cor editorial. Não restaurar creme, marrom ou laranja. Esta etapa centraliza os valores existentes sem migrar componentes, reorganizar páginas ou alterar lógica, navegação ou contratos.

## Fonte única

`frontend/src/styles/tokens.css`, importado por `src/index.css`, concentra um único `@font-face` da Manrope local, com pesos 200–800 e `font-display: swap`. `--font-interface` alimenta os estilos locais e `--font-sans` do Tailwind. As declarações isoladas de Inter foram substituídas por esse token. `--font-editorial` mantém a Georgia que já existia na ilustração de capa da Home; ela não é a fonte da interface.

## Tokens estabelecidos

| Grupo | Tokens e valores preservados |
| --- | --- |
| Superfícies | `--surface-background` (#fff), `--surface-muted` (#f3f4f3), `--surface-subtle` (#f5f6f5), `--surface-hover` (#f0f2f0), `--surface-avatar` (#e5e8e6) |
| Texto e ações | `--text-primary` (#202323), `--text-secondary` (#606565), `--action-primary` (#000), `--action-primary-foreground` (#fff), `--focus-ring` |
| Bordas | `--border-default`, `--border-subtle`, `--border-menu`, `--border-field`, `--border-book` |
| Compatibilidade nativa | `--border-native`, `--surface-native-hover`, `--focus-native`, `--radius-native`: mantêm a aparência atual dos controles ainda não migrados |
| Feedback existente | `--feedback-error`, `--feedback-destructive`, `--feedback-error-hover`: preservam os vermelhos que já sinalizavam erros/ações destrutivas, sem introduzir cor de marca |
| Espaçamento | `--space-1/2/3/4/5/6/8/10`: 4/8/12/16/20/24/32/40 px |
| Raios | `--radius-control/menu/panel/book/pill`: 10/12/16/18/999 px |
| Controles | `--control-height-compact/default`: 36/44 px; `--control-size-book`: 38 px; `--icon-size-book`: 18 px |
| BookCard | `--book-content-padding`: 13 px; `--book-content-min-height`: 118 px; `--book-title-author-gap`: 5 px; `--surface-cover-control` |
| Sombras | `--shadow-control/menu/floating/book/book-menu`: fórmulas existentes, sem aumentar profundidade |
| Overlays | `--overlay-drawer/dialog/lightbox`: opacidades existentes |
| Movimento | `--duration-control/overlay/drawer`: 160/250/350 ms; `--ease-drawer`: curva existente |
| Camadas | `--layer-drawer-overlay/drawer/floating/dialog-overlay/dialog`: 60/61/80/100/101, sem reordenar sobreposições |

Os aliases `--ui-background/foreground/primary/muted/muted-foreground/border/destructive` ficam na raiz, disponíveis também nos portais Base UI. `shadcn.css` mantém o mapeamento `@theme inline` e o acabamento atual dos wrappers. A classe `.landing` continua com os aliases legados necessários; agora seus valores vêm dos mesmos tokens. Não houve troca de estilo shadcn, versão ou dependências.

## Duplicações eliminadas

- Dois carregamentos de Manrope passaram a um único `@font-face` global.
- Declarações de família tipográfica, inclusive nos shorthands de menus, usam a fonte central.
- 188 ocorrências de cores hexadecimais foram substituídas por referências semânticas; `white` também passou ao token de superfície.
- Bordas arredondadas de controles/menus/painéis, sombras flutuantes e camadas equivalentes compartilham tokens, mantendo os valores anteriores.
- Seis nomes de variáveis do BookCard que eram sobrescritos ou não utilizados foram retirados de `catalog-density.css`. O padding específico do detalhado usa `--catalog-book-detail-padding` (12 px e 10 px no breakpoint existente), preservando seu resultado sem conflitar com o padding de 13 px do card.

Dimensões editoriais, tamanhos de capas, breakpoints e outras particularidades de página permanecem locais. Não foi feita substituição indiscriminada de cada número por um token.

## Validação

- `npm run build` e `npm run lint` no frontend.
- Comparação dos 14 CSS fora da escala de catálogo: mesmos valores e regras após resolução dos tokens, desconsiderando a alteração autorizada de Inter para Manrope e a centralização da fonte.
- Comparação separada das variáveis de `catalog-density.css` em todos os seus blocos responsivos, preservando valores efetivos e padding do detalhado.
- Conferência de um único `@font-face` e ausência de declarações restantes de Inter nos estilos.
- O build mantém o aviso já existente de JavaScript acima de 500 kB.

Esta conferência é de código e compilação; não substitui uma revisão visual completa de todas as páginas. Nenhuma etapa seguinte foi iniciada.
