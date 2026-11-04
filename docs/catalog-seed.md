# Catálogo inicial — Google Books

A carga contém **60 livros reais**, com **20 de Ficção, 20 de Tecnologia e 20 de Biografias**. A coleta foi realizada em 26/10/2026, usando a chave já configurada no projeto, sem incluí-la nos artefatos.

Foram preservados 435 candidatos da API e selecionados 60 volumes distintos: **23 em português (`pt-BR`), 35 em inglês e 2 em espanhol**. Todos os selecionados têm autores, categorias compatíveis com o discover e URL de capa. A preferência por português não foi tratada como garantia da API: os resultados foram classificados pelo idioma efetivamente retornado, não apenas por `langRestrict`.

## Arquivos

- `backend/src/main/resources/db/seed/books.sql`: SQL PostgreSQL autossuficiente, sem chamadas de rede.
- `backend/src/main/resources/application-seed.properties`: ativação pelo Spring Boot.
- `docs/seed/google-books.json`: snapshot com metadados reais, candidatos, seleção, temas, idiomas e histórico das consultas sem credenciais.
- `docs/seed/catalog.md`: relação dos 60 volumes, com links de origem.
- `backend/scripts/catalog-seed.mjs`: coleta retomável e geração determinística do SQL, usando Node 20+ e sem bibliotecas adicionais.

## Executar a carga

No diretório `backend`, usando a configuração PostgreSQL de desenvolvimento já existente:

```powershell
./mvnw.cmd spring-boot:run '-Dspring-boot.run.profiles=dev,seed'
```

Os dois perfis são exigidos pela expressão `spring.config.activate.on-profile=dev & seed`. Iniciar com `dev`, `seed` isolado ou outro perfil não executa esse arquivo. O SQL não usa o nome automático `data.sql`, para não ser descoberto incidentalmente por outra configuração.

O Spring prepara/verifica o esquema JPA normalmente e depois executa a carga. Não há migração nem alteração do `ddl-auto` do projeto. Após a primeira execução, pode-se iniciar novamente apenas com `dev`; manter `dev,seed` também é seguro graças à idempotência. O `DataSeeder` administrativo existente continua independente e mantém seu comportamento anterior.

**A implementação não executou a carga no banco de desenvolvimento existente.** A validação utilizou exclusivamente uma instância PostgreSQL descartável.

## Preservação e regras

- Livros são reconhecidos por `google_books_id`. Metadados e vínculos de livros existentes não são modificados.
- Autores e categorias são reconhecidos por nomes normalizados conforme `NameNormalizer`. Nomes alternativos existentes também identificam a entidade correta, preservando o nome principal.
- Categorias compostas são separadas por `/`; nomes de autores com vírgula seguem a inversão já aplicada pelo serviço atual.
- IDs são obtidos das sequences/identities do PostgreSQL, sem reservar faixas numéricas nem substituir registros existentes.
- O SQL usa uma única transação e bloqueia as tabelas de catálogo durante a importação para evitar criação concorrente de nomes. Tabelas temporárias são removidas no commit; um erro interrompe a inicialização e desfaz a carga.
- Os únicos dados permanentes escritos são livros, autores, nomes, categorias e seus vínculos. Não são criadas avaliações, favoritos, estantes, usuários ou relações de leitura.
- Valores opcionais ausentes continuam nulos. A classificação de maturidade usa `NOT_MATURE` quando ausente ou desconhecida, conforme o mapper atual. O timestamp de inserção é informado explicitamente.
- Classificações e descrições são as fornecidas pelo Google Books. Notas externas eventualmente presentes no snapshot bruto não são importadas para avaliações do LetterBooks.

## Reproduzir ou retomar a coleta

Na raiz do repositório, para regenerar o SQL **sem API, chave ou conexão de rede**:

```powershell
node backend/scripts/catalog-seed.mjs
```

Para retomar uma coleta incompleta:

```powershell
node backend/scripts/catalog-seed.mjs --collect
```

A chave é obtida de `GOOGLE_BOOKS_API_KEY`, `GOOGLEBOOKS_API_KEY` ou da configuração local já existente. Seu valor e a URL autenticada nunca são registrados. Cada resposta aproveitável é salva imediatamente no snapshot. Consultas já concluídas com resultados são reutilizadas; cada consulta pendente tem no máximo duas tentativas. O resumo final informa `complete`, quantidade selecionada e totais por tema. Uma coleta parcial não é apresentada como 60 livros.

Não editar o SQL para inventar metadados; alterações na seleção devem ser feitas a partir de dados reais no snapshot e seguidas da regeneração. Os metadados de descrições são preservados em UTF-8, com escape de literais SQL e JSON.

## Testes

```powershell
# Raiz do repositório
node --test backend/scripts/catalog-seed.test.mjs

# Diretório backend — somente banco descartável previamente criado
./mvnw.cmd '-Dtest=CatalogSeedPostgresTests' '-Dseed.test.url=jdbc:postgresql://127.0.0.1:55449/letterbooks_seed_test' test
```

Os testes de PostgreSQL exigem explicitamente um banco local chamado `letterbooks_seed_test`, usuário de teste `codex_test` e sem senha. Eles **criam e removem o esquema**; nunca apontar para o banco da aplicação. Sem `seed.test.url`, esses testes são ignorados. O inicializador nativo do Spring é usado nos testes, com contextos mínimos que não carregam o seeder de administrador, endpoints ou clientes externos.

Cobertura: carga de 60 volumes, reexecução, preservação de livros existentes e dados pessoais, reaproveitamento de nomes alternativos, exatamente um nome principal por entidade, normalização, leitura dos metadados persistidos, filtros locais das três seções, detalhes sem chamada externa, inserção JPA posterior, combinação de perfis e rollback integral. Os testes Node verificam normalização, escape de caracteres e reprodução exata do SQL a partir do snapshot.

Resultado da validação desta entrega: **3 testes Node aprovados**; suíte do backend com **149 testes executados sem falhas e 10 ignorados** por suas condições de integração, excluindo o teste genérico de inicialização `LetterbooksApplicationTests`. Os quatro testes novos de seed foram executados em PostgreSQL 18 descartável, incluindo a carga por Spring Boot. A instância descartável foi encerrada ao final.

## Limites

Busca e discover continuam tentando a API antes do fallback local; esta entrega não implementa modo exclusivamente local. As capas são URLs externas e não foram baixadas. As descrições e demais metadados refletem a data da coleta e não são atualizados automaticamente. Nenhum endpoint, DTO, regra de autenticação ou persistência sob demanda foi alterado.

Referências: [inicialização de dados no Spring Boot](https://docs.spring.io/spring-boot/how-to/data-initialization.html) e [Google Books API](https://developers.google.com/books/docs/v1/using).
