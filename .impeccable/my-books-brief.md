# Minha Biblioteca — consolidação

Extensão Operate/Read, code-led, da identidade neutra aprovada, sem nova direção visual. Manrope local, texto 14px, título 28–32px, ícones Lucide, preto/cinza/branco e capas trazendo cor.

## Contrato

/my-books abre Todos: uma grade paginada de 20 livros. Abas com sublinhado Todos, Quero ler, Lendo, Lidos, Abandonados, Favoritos e Estantes substituem o resumo e os quatro protótipos. URL restaura status, favorite, page, view=shelves e shelfId; filtros combinados e legado /my-books/list são preservados. Abas quebram linhas no celular.

Estantes lista somente coleções personalizadas, 20 por página, mais recentes primeiro. Mosaico ~200px: quatro quadrados iguais 2×2 com object-fit cover; posições vazias neutras sem repetir capas. Em 320px permanecem duas colunas. Clique abre identificação e livros paginados na mesma página. Criar/editar usam diálogo; privadas por padrão, nome 100 e descrição 1000; confirmação de exclusão informa preservação dos livros. Retirar da estante é diferente de remover da biblioteca.

## Primeiro viewport e interação

Cabeçalho compartilhado, título compacto, abas discretas e primeira fileira de capas ou mosaicos pequenos, sem card externo grande. Interação principal: adicionar livro a uma estante em diálogo sem perder pesquisa, página ou URL de origem. Seleção única, estantes já associadas desabilitadas; criação dentro do diálogo seleciona a nova estante. Interface estática, sem animação decorativa, controles 44px, foco visível, mensagens status/alert, campos rotulados.

## Backend

Resposta de resumo acrescenta até quatro previewBooks estáveis por ID crescente. Contagens e prévias usam duas consultas agrupadas por página, além da consulta paginada de estantes. GET /bookshelves/{id}/summary e /bookshelves/{id}/books são aditivos; contrato antigo mantido. Relação pessoal pertence ao autenticado e pode ser nula. Um único POST verifica propriedade/duplicidade e associa o livro; se a relação pessoal ainda não existe, cria WANT_TO_READ sem favorito na mesma transação, preservando relações existentes. Não há novas dependências ou migrações.

## Evidência

Build e lint passaram. Dez testes de backend passaram: propriedade, paginação, relações do solicitante, prévias limitadas e chamadas em lote, preservação, duplicidade e rollback pelo Spring TransactionInterceptor com mocks. O teste transacional não é integração com banco; consultas JPQL foram compiladas pelo Hibernate sem conexão a banco.

Browser com adapter simulado validou criar estante privada/pública, nome duplicado, editar, cancelar/confirmar exclusão, seleção com associações existentes desabilitadas, criação inline com seleção automática e adição pelo Explorar preservando a URL de pesquisa. Retirar da estante preservou a biblioteca. Excluir a única estante da segunda página entre 21 estantes ajustou para página zero com 20 itens; falha ao salvar preservou os campos. Visitantes seguiram ao login com retorno à origem. URL legada com status/favorito combinados e página inválida foi ajustada; histórico simulado restaurou as seleções.

As seis capturas .impeccable/review/library-{books,shelves,add}-{desktop,mobile}.png estão completas e válidas, em desktop 1440×1000 e mobile 320×700. Tablet 768px e reflow 640×500 foram verificados por DOM, sem overflow; reflow não é zoom real. A revisão visual independente inicial identificou somente o link para Biblioteca com altura insuficiente. A correção elevou sua área para 44px; revisão final independente dessa correção concluiu ship, sem outros achados materiais na revisão inicial completa. Documentação consolidada em PRODUCT.md, seção específica de DESIGN.md e docs/my-books.md.

Dados ilustrativos, nenhuma conta real alterada. Launcher Impeccable indisponível (cache_directory_failed), fallback manual declarado. Trabalho code-led no mundo visual existente, sem comp aprovada; detector Impeccable não executado. Frontmatter de DESIGN.md e .impeccable/design.json preservados; drift preexistente fora do escopo, sem reparo solicitado. As capturas e validações anteriores dos protótipos permanecem evidência histórica, sem reabrir a comparação.
