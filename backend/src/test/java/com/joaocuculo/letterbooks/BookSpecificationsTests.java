package com.joaocuculo.letterbooks;

import com.joaocuculo.letterbooks.dto.request.BookSearchRequestDTO;
import com.joaocuculo.letterbooks.entities.*;
import com.joaocuculo.letterbooks.specifications.BookSpecifications;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class BookSpecificationsTests {

    private static SessionFactory sessionFactory;

    @BeforeAll
    static void configureMappings() {
        // Valida os caminhos das consultas com os mapeamentos reais, sem conectar ao banco.
        Configuration configuration = new Configuration()
                .setProperty("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect")
                .setProperty("hibernate.boot.allow_jdbc_metadata_access", "false")
                .setProperty("hibernate.hbm2ddl.auto", "none");
        for (Class<?> entity : new Class<?>[]{Book.class, Author.class, AuthorName.class,
                Category.class, CategoryName.class, User.class, UserBook.class,
                Rating.class, Bookshelf.class, BookshelfItem.class, PasswordReset.class}) {
            configuration.addAnnotatedClass(entity);
        }
        sessionFactory = configuration.buildSessionFactory();
    }

    @AfterAll
    static void closeMappings() {
        if (sessionFactory != null) {
            sessionFactory.close();
        }
    }

    @Test
    void authorFilterUsesAuthorNamesMapping() {
        validateQuery(new BookSearchRequestDTO(null, "F. Dostoiévski", null, null, null, null));
    }

    @Test
    void freeTextFilterUsesAuthorNamesMapping() {
        validateQuery(new BookSearchRequestDTO(null, null, null, null, null, "Fiódor Dostoiévski"));
    }

    @Test
    void combinedFiltersKeepDistinctBooks() {
        validateQuery(new BookSearchRequestDTO("Crime", "Dostoiévski", null, "Ficção", null, "castigo"));
    }

    private void validateQuery(BookSearchRequestDTO filter) {
        try (var session = sessionFactory.openSession()) {
            var cb = session.getCriteriaBuilder();
            var query = cb.createQuery(Book.class);
            var root = query.from(Book.class);
            var predicate = assertDoesNotThrow(() ->
                    BookSpecifications.withFilters(filter).toPredicate(root, query, cb));
            query.select(root).where(predicate);
            assertDoesNotThrow(() -> session.createQuery(query));
            assertTrue(query.isDistinct());
        }
    }
}
