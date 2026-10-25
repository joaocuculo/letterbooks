package com.joaocuculo.letterbooks;

import com.joaocuculo.letterbooks.entities.*;
import com.joaocuculo.letterbooks.entities.enums.*;
import com.joaocuculo.letterbooks.repositories.*;
import com.joaocuculo.letterbooks.services.RatingSummaryService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import org.hibernate.SessionFactory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.*;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.orm.jpa.*;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.*;

import javax.sql.DataSource;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@EnabledIfSystemProperty(named = "ratings.test.url", matches = ".+")
@SpringJUnitConfig(RatingAveragePostgresTests.Config.class)
@Transactional
class RatingAveragePostgresTests {
    @Configuration
    @EnableTransactionManagement
    @EnableJpaRepositories(basePackages = "com.joaocuculo.letterbooks.repositories")
    static class Config {
        @Bean DataSource dataSource() {
            String url = System.getProperty("ratings.test.url");
            if (!url.matches("jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/letterbooks_ratings_test"))
                throw new IllegalArgumentException("Use only the isolated local ratings test database.");
            return new DriverManagerDataSource(url, "codex_test", "");
        }
        @Bean LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource source) {
            var bean = new LocalContainerEntityManagerFactoryBean();
            bean.setDataSource(source);
            bean.setPackagesToScan("com.joaocuculo.letterbooks.entities");
            bean.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
            bean.setJpaPropertyMap(Map.of("hibernate.hbm2ddl.auto", "create-drop", "hibernate.generate_statistics", true));
            return bean;
        }
        @Bean PlatformTransactionManager transactionManager(EntityManagerFactory factory) {
            return new JpaTransactionManager(factory);
        }
        @Bean RatingSummaryService summaries(RatingRepository ratings) { return new RatingSummaryService(ratings); }
    }

    @Autowired EntityManager em;
    @Autowired EntityManagerFactory factory;
    @Autowired RatingSummaryService summaries;

    @Test void aggregatesAllUsersInOneQueryAndReflectsEditsAndDeletes() {
        Book rated = book("rated"), single = book("single"), unrated = book("unrated");
        User first = user("first"), second = user("second"), third = user("third");
        Rating a = rating(rated, first, 5);
        Rating b = rating(rated, second, 4);
        Rating c = rating(rated, third, 4);
        rating(single, first, 0); // Zero is a valid score, distinct from no ratings.
        em.flush();
        em.clear();
        var statistics = factory.unwrap(SessionFactory.class).getStatistics();
        statistics.clear();
        var result = summaries.averagesFor(List.of("external", unrated.getGoogleBooksId(), "single", "rated", "rated"));
        assertEquals(13.0 / 3, result.get("rated"), 0.000001);
        assertEquals(0.0, result.get("single"));
        assertNull(result.get("unrated"));
        assertNull(result.get("external"));
        assertEquals(1, statistics.getPrepareStatementCount());
        assertEquals(0, statistics.getEntityLoadCount());
        assertEquals(3L, em.createQuery("select count(b) from Book b", Long.class).getSingleResult());

        em.find(Rating.class, a.getId()).setScore(1);
        em.flush();
        assertEquals(3.0, summaries.averagesFor(List.of("rated")).get("rated"));
        em.remove(em.find(Rating.class, a.getId()));
        em.flush();
        assertEquals(4.0, summaries.averagesFor(List.of("rated")).get("rated"));
        em.remove(em.find(Rating.class, b.getId()));
        em.remove(em.find(Rating.class, c.getId()));
        em.flush();
        assertNull(summaries.averagesFor(List.of("rated")).get("rated"));
    }

    @Test void emptyCatalogDoesNotIssueAnAggregationQuery() {
        var statistics = factory.unwrap(SessionFactory.class).getStatistics();
        statistics.clear();
        assertTrue(summaries.averagesFor(List.of()).isEmpty());
        assertEquals(0, statistics.getPrepareStatementCount());
    }

    private Book book(String id) {
        Book book = new Book(); book.setGoogleBooksId(id); book.setTitle(id); em.persist(book); return book;
    }
    private User user(String name) {
        User user = new User(name, name + "@example.test", "unused", UserRole.USER, UserStatus.ACTIVE);
        em.persist(user); return user;
    }
    private Rating rating(Book book, User user, int score) {
        Rating rating = new Rating(score, null, user, book); em.persist(rating); return rating;
    }
}
