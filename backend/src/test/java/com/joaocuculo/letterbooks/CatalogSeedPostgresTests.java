package com.joaocuculo.letterbooks;

import com.joaocuculo.letterbooks.entities.*;
import com.joaocuculo.letterbooks.entities.enums.*;
import com.joaocuculo.letterbooks.repositories.*;
import com.joaocuculo.letterbooks.services.*;
import com.joaocuculo.letterbooks.specifications.BookSpecifications;
import com.joaocuculo.letterbooks.utils.NameNormalizer;
import jakarta.persistence.EntityManagerFactory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import javax.sql.DataSource;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@EnabledIfSystemProperty(named="seed.test.url", matches=".+")
class CatalogSeedPostgresTests {
    @TestConfiguration(proxyBeanMethods=false)
    @EnableAutoConfiguration
    @EntityScan("com.joaocuculo.letterbooks.entities")
    @EnableJpaRepositories("com.joaocuculo.letterbooks.repositories")
    static class Config {}

    private ConfigurableApplicationContext start(String... profiles) {
        String url = System.getProperty("seed.test.url");
        if (!url.matches("jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/letterbooks_seed_test"))
            throw new IllegalArgumentException("Only the disposable local letterbooks_seed_test database is allowed.");
        return new SpringApplicationBuilder(Config.class).web(WebApplicationType.NONE).profiles(profiles).run(
                "--spring.profiles.active="+String.join(",",profiles),
                "--spring.datasource.url="+url,"--spring.datasource.username=codex_test","--spring.datasource.password=",
                "--spring.jpa.hibernate.ddl-auto=create-drop","--spring.jpa.show-sql=false",
                "--spring.main.banner-mode=off",
                "--spring.jpa.properties.hibernate.format_sql=false");
    }
    private ResourceDatabasePopulator populator() {
        var p = new ResourceDatabasePopulator(new ClassPathResource("db/seed/books.sql"));
        p.setSqlScriptEncoding("UTF-8"); return p;
    }
    private Map<String,Long> counts(JdbcTemplate jdbc) {
        Map<String,Long> result = new LinkedHashMap<>();
        for (String table: List.of("books","authors","author_name","categories","category_name","book_author","book_category"))
            result.put(table,jdbc.queryForObject("select count(*) from "+table,Long.class));
        return result;
    }
    private tools.jackson.databind.JsonNode snapshot() throws Exception {
        return tools.jackson.databind.json.JsonMapper.builder().build().readTree(Files.readString(Path.of("../docs/seed/google-books.json")));
    }

    @Test void springInitializesSixtyBooksAndReexecutionIsIdempotent() throws Exception {
        try(var context=start("dev","seed")) {
            assertNotNull(context.getBean("dataSourceScriptDatabaseInitializer"));
            var ds=context.getBean(DataSource.class); var jdbc=new JdbcTemplate(ds);
            assertEquals(60L,jdbc.queryForObject("select count(*) from books",Long.class));
            assertEquals(0L,jdbc.queryForObject("select count(*) from books b where not exists (select 1 from book_author a where a.book_id=b.id) or not exists (select 1 from book_category c where c.book_id=b.id)",Long.class));
            assertEquals(0L,jdbc.queryForObject("select count(*) from authors a where (select count(*) from author_name n where n.author_id=a.id and n.is_primary) <> 1",Long.class));
            assertEquals(0L,jdbc.queryForObject("select count(*) from categories c where (select count(*) from category_name n where n.category_id=c.id and n.is_primary) <> 1",Long.class));
            var before=counts(jdbc); var rows=jdbc.queryForList("select * from books order by id");
            populator().execute(ds); assertEquals(before,counts(jdbc));
            assertEquals(rows,jdbc.queryForList("select * from books order by id"));
            for(String table:List.of("users","ratings","user_book")) assertEquals(0L,jdbc.queryForObject("select count(*) from "+table,Long.class));
            for(var row:jdbc.queryForList("select name, normalized_name from author_name union all select name, normalized_name from category_name"))
                assertEquals(NameNormalizer.normalize((String)row.get("name")),row.get("normalized_name"));
            var google=mock(GoogleBooksService.class);
            var repository=context.getBean(BookRepository.class);
            var userBooks=context.getBean(UserBookRepository.class);
            var service=new BookService(repository,google,null,null,userBooks,new RatingSummaryService(context.getBean(RatingRepository.class)));
            for(var book:snapshot().get("books")) {
                String id=book.get("id").asText();
                var stored=jdbc.queryForMap("select title, description from books where google_books_id=?",id);
                assertEquals(book.get("volumeInfo").get("title").asText(),stored.get("title"));
                assertEquals(book.get("volumeInfo").path("description").asString(null),stored.get("description"));
            }
            var tx=new org.springframework.transaction.support.TransactionTemplate(context.getBean(org.springframework.transaction.PlatformTransactionManager.class));
            tx.execute(status -> {
                assertEquals("LOCAL",service.findByGoogleBooksId(rows.getFirst().get("google_books_id").toString()).source());
                for(String subject:List.of("fiction","technology","biograph"))
                    assertTrue(repository.findAll(BookSpecifications.withSubjects(List.of(subject)),PageRequest.of(0,100)).getTotalElements()>=20);
                var newBook=new Book();newBook.setGoogleBooksId("after-seed");newBook.setTitle("Depois da carga"); repository.saveAndFlush(newBook);
                assertNotNull(newBook.getId());return null;
            });
            verifyNoInteractions(google);
        }
    }

    @Test void profilesRequireBothDevAndSeed() {
        for(String[] profiles:List.of(new String[]{"dev"},new String[]{"seed"},new String[]{"test"})) {
            try(var context=start(profiles)) {
                assertArrayEquals(profiles,context.getEnvironment().getActiveProfiles());
                assertEquals(0L,new JdbcTemplate(context.getBean(DataSource.class)).queryForObject("select count(*) from books",Long.class));
            }
        }
    }

    @Test void preservesExistingBookAndReusesAlternativeNamesWithoutTouchingPersonalData() throws Exception {
        try(var context=start("dev")) {
            var ds=context.getBean(DataSource.class);var jdbc=new JdbcTemplate(ds);
            var seedBooks=snapshot().get("books");
            var authorCounts=new HashMap<String,Integer>();
            for(var entry:seedBooks)for(var name:entry.get("volumeInfo").get("authors"))authorCounts.merge(name.asText(),1,Integer::sum);
            var first=seedBooks.get(0);
            for(var entry:seedBooks)if(authorCounts.get(entry.get("volumeInfo").get("authors").get(0).asText())>1){first=entry;break;}
            String googleId=first.get("id").asText();
            String author=first.get("volumeInfo").get("authors").get(0).asText().trim();
            if(author.contains(",")){var pieces=new ArrayList<>(Arrays.asList(author.split(",")));pieces.replaceAll(String::trim);Collections.reverse(pieces);author=String.join(" ",pieces);}
            String category=first.get("volumeInfo").get("categories").get(0).asText().split("/")[0].trim();
            var em=context.getBean(EntityManagerFactory.class).createEntityManager();em.getTransaction().begin();
            var a=new Author();a.addPrimaryName("Nome preservado",NameNormalizer.normalize("Nome preservado"));a.addAlternativeName(author,NameNormalizer.normalize(author));em.persist(a);
            var c=new Category();c.addPrimaryName("Categoria preservada",NameNormalizer.normalize("Categoria preservada"));c.addAlternativeName(category,NameNormalizer.normalize(category));em.persist(c);
            var b=new Book();b.setGoogleBooksId(googleId);b.setTitle("Título alterado pelo usuário");b.setMaturityRating(MaturityRating.NOT_MATURE);b.getAuthors().add(a);b.getCategories().add(c);em.persist(b);
            var user=new User("Reader","reader@example.test","unused",UserRole.USER,UserStatus.ACTIVE);em.persist(user);
            em.persist(new Rating(4,"Comentário preservado",user,b));
            em.persist(new UserBook(UserBookStatus.READING,true,12,null,null,user,b));
            em.getTransaction().commit();em.close();
            var bookBefore=jdbc.queryForList("select * from books where google_books_id=?",googleId);
            var linksBefore=jdbc.queryForList("select * from book_author where book_id=?",b.getId());
            var userBefore=jdbc.queryForList("select * from users");var ratingsBefore=jdbc.queryForList("select * from ratings");var relationBefore=jdbc.queryForList("select * from user_book");
            populator().execute(ds);
            assertEquals(60L,jdbc.queryForObject("select count(*) from books",Long.class));
            assertEquals(bookBefore,jdbc.queryForList("select * from books where google_books_id=?",googleId));
            assertEquals(linksBefore,jdbc.queryForList("select * from book_author where book_id=?",b.getId()));
            assertEquals(a.getId(),jdbc.queryForObject("select author_id from author_name where normalized_name=?",Long.class,NameNormalizer.normalize(author)));
            assertTrue(jdbc.queryForObject("select count(*) from book_author where author_id=?",Long.class,a.getId())>1);
            assertEquals("Nome preservado",jdbc.queryForObject("select name from author_name where author_id=? and is_primary",String.class,a.getId()));
            assertEquals(c.getId(),jdbc.queryForObject("select category_id from category_name where normalized_name=?",Long.class,NameNormalizer.normalize(category)));
            assertEquals(userBefore,jdbc.queryForList("select * from users"));assertEquals(ratingsBefore,jdbc.queryForList("select * from ratings"));assertEquals(relationBefore,jdbc.queryForList("select * from user_book"));
            var before=counts(jdbc);populator().execute(ds);assertEquals(before,counts(jdbc));
        }
    }

    @Test void failedSqlRollsBackTheWholeCatalog() throws Exception {
        try(var context=start("dev")) {
            var jdbc=new JdbcTemplate(context.getBean(DataSource.class));
            String sql=new ClassPathResource("db/seed/books.sql").getContentAsString(StandardCharsets.UTF_8).replace("COMMIT;","INSERT INTO nonexistent_seed_table VALUES (1);\nCOMMIT;");
            var p=new ResourceDatabasePopulator(new ByteArrayResource(sql.getBytes(StandardCharsets.UTF_8)));p.setSqlScriptEncoding("UTF-8");
            // A disposable physical connection closes the failed SQL transaction immediately.
            var direct=new DriverManagerDataSource(System.getProperty("seed.test.url"),"codex_test","");
            assertThrows(Exception.class,()->p.execute(direct));
            assertTrue(counts(jdbc).values().stream().allMatch(n->n==0));
        }
    }
}
