# Marca LetterBooks

Kit original fornecido pelo proprietário do projeto.

- `frontend/public/brand/svg/`: logos horizontais, compactas, wordmarks e ícones vetoriais, com variantes pretas e brancas.
- `frontend/public/brand/png/`: equivalentes rasterizados, separados por formato e resolução.
- `frontend/public/`: favicon SVG/ICO, PNGs de navegador, Apple Touch Icon e ícones de 192/512 px declarados em `site.webmanifest`.
- `docs/brand/referencias/`: imagens de exploração e manual original; não são carregadas pelo site.
- `LEIA-ME-original.txt`: orientações originais do kit.

O componente `BrandLogo` centraliza a logo horizontal: preta em superfícies claras e branca em superfícies escuras. Usa PNG de 740 px com variante de 1480 px para telas de alta densidade, preservando a tipografia original sem depender das fontes instaladas. Mantém proporção e texto alternativo. A marca aparece no cabeçalho compartilhado, nas páginas de autenticação, no rodapé da Home e na navegação legada.

SVGs com texto permanecem disponíveis como fontes editáveis; conforme a observação do kit, dependem de fontes do sistema. Para uso futuro como logo web vetorial, converter o texto em contornos após definir a fonte definitiva. Ícones isolados já são vetores com contornos. Versões brancas transparentes destinam-se a fundos escuros; versões com fundo explícito são opacas. Logos compactas e wordmarks ficam disponíveis para usos que exijam esses formatos.

O manifest define os ícones usados por navegadores ao adicionar o site à tela inicial; não implementa funcionamento offline.
