# LetterBooks

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Leitores que querem avaliar e gerenciar livros. Projeto de TCC com entrega prevista para o fim de outubro de 2026.

## Product Purpose

Registrar a relação pessoal com livros: quero ler, lendo, lidos, favoritos, notas e comentários nas próprias avaliações. A referência funcional é o Letterboxd aplicado a livros.

## Capabilities and Constraints

React com TypeScript e Vite, Tailwind e CSS; Java 21, Spring Boot e PostgreSQL. Backend implementado, frontend em desenvolvimento. Cadastro, autenticação, recuperação de senha, busca, biblioteca e criação/edição de avaliações já possuem integração. Listas personalizadas existem no backend como Bookshelf; sua interface ainda está pendente, assim como excluir avaliações no frontend.

Google Books fornece descoberta e busca. Livros só são persistidos após uma interação. A busca possui alternativa local quando a API falha; a descoberta ainda não. A Home de apresentação não depende dessa API.

## Brand Commitments

Nome LetterBooks. Conteúdo em português. O usuário pediu páginas claras e modernas, capas protagonistas, referências de Pinterest, Apple, Notion e Stripe. A Home Diagonal foi aprovada com interface em preto, branco e cinza fixos, preservando as cores das capas. A comparação entre modelos e o seletor de cores foram encerrados. Login e Cadastro Galeria estendem essa identidade com formulários simples e cinco capas locais estáticas no mesmo layout compartilhado; recuperação de senha usa formulário central e capas em escada; a redefinição de senha compartilha essa composição. O cadastro exige confirmação de senha e informa cinco requisitos: 8 a 72 unidades UTF-16, maiúscula e minúscula Unicode, número ASCII e pontuação/símbolo Unicode; frontend e backend também aplicam limite de 72 bytes UTF-8 do BCrypt. A confirmação não é armazenada. O cadastro mantém integração e confirmação de sucesso na própria tela.

## Evidence on Hand

Esboço do usuário: capas diagonais à esquerda, texto à direita e avaliações sobrepostas abaixo do texto, com gradiente para o restante da página. As avaliações da Home são exemplos explicitamente ilustrativos, não depoimentos reais. As capas locais representam edições em inglês com títulos apresentados em português. Não há métricas, preços ou prova social confirmados.
