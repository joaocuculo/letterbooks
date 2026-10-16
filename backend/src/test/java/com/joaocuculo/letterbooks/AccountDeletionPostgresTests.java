package com.joaocuculo.letterbooks;

import com.joaocuculo.letterbooks.config.*;
import com.joaocuculo.letterbooks.dto.request.*;
import com.joaocuculo.letterbooks.entities.*;
import com.joaocuculo.letterbooks.entities.enums.*;
import com.joaocuculo.letterbooks.repositories.*;
import com.joaocuculo.letterbooks.services.UserService;
import com.joaocuculo.letterbooks.exceptions.BusinessException;
import jakarta.persistence.EntityManagerFactory;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.*;
import org.springframework.dao.ConcurrencyFailureException;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.orm.jpa.*;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.transaction.*;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.support.TransactionTemplate;
import javax.sql.DataSource;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

@EnabledIfSystemProperty(named = "deletion.test.url", matches = ".+")
@SpringJUnitConfig(AccountDeletionPostgresTests.Config.class)
class AccountDeletionPostgresTests {
    @Configuration
    @EnableTransactionManagement
    @EnableJpaRepositories(basePackages = "com.joaocuculo.letterbooks.repositories")
    static class Config {
        @Bean DataSource dataSource() {
            String url = System.getProperty("deletion.test.url");
            if (!url.matches("jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/letterbooks_deletion_test"))
                throw new IllegalArgumentException("Use only the isolated local deletion test database.");
            return new DriverManagerDataSource(url, "codex_test", "");
        }
        @Bean LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource source) {
            var bean = new LocalContainerEntityManagerFactoryBean();
            bean.setDataSource(source);
            bean.setPackagesToScan("com.joaocuculo.letterbooks.entities");
            bean.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
            bean.setJpaPropertyMap(Map.of("hibernate.hbm2ddl.auto", "create-drop"));
            return bean;
        }
        @Bean PlatformTransactionManager transactionManager(EntityManagerFactory factory) { return new JpaTransactionManager(factory); }
        @Bean PasswordEncoder encoder() { return new BCryptPasswordEncoder(); }
        @Bean UserService users(UserRepository users, PasswordEncoder encoder, BookshelfItemRepository items,
                BookshelfRepository shelves, RatingRepository ratings, UserBookRepository books, PasswordResetRepository resets) {
            return new UserService(users, encoder, items, shelves, ratings, books, resets);
        }
    }

    @Autowired UserService service;
    @Autowired UserRepository users;
    @Autowired BookRepository books;
    @Autowired BookshelfRepository shelves;
    @Autowired BookshelfItemRepository items;
    @Autowired RatingRepository ratings;
    @Autowired UserBookRepository userBooks;
    @Autowired PasswordResetRepository resets;
    @Autowired AuthorRepository authors;
    @Autowired CategoryRepository categories;
    @Autowired PasswordEncoder encoder;
    @Autowired DataSource source;
    @Autowired PlatformTransactionManager manager;
    JdbcTemplate jdbc;
    TransactionTemplate tx;

    @BeforeEach void clean() {
        jdbc = new JdbcTemplate(source);
        tx = new TransactionTemplate(manager);
        jdbc.execute("truncate table users, books, authors, categories restart identity cascade");
    }

    User create(UserRole role, UserStatus status) {
        return tx.execute(s -> users.saveAndFlush(new User("Test", UUID.randomUUID()+"@example.com", encoder.encode("old"), role, status)));
    }
    JWTUserData caller(User user) { return new JWTUserData(user.getId(), user.getEmail(), user.getRole(), 0); }
    void delete(User user) { service.delete(user.getId(), new AccountDeletionRequestDTO("old"), caller(user)); }

    void attach(User user) {
        tx.executeWithoutResult(s -> {
            Book book = books.save(new Book("test-book", "Shared book", null, null, null, null, null, null, null, null, null, null, null));
            Author author = new Author(); author.addPrimaryName("Shared author", "shared author");
            Category category = new Category(); category.addPrimaryName("Shared category", "shared category");
            book.getAuthors().add(authors.save(author));
            book.getCategories().add(categories.save(category));
            Bookshelf shelf = shelves.save(new Bookshelf("Test shelf", null, false, user));
            items.save(new BookshelfItem(shelf, book));
            ratings.save(new Rating(5, "Personal review", user, book));
            userBooks.save(new UserBook(UserBookStatus.WANT_TO_READ, false, null, null, null, user, book));
            resets.save(new PasswordReset(resetHash(), LocalDateTime.now().plusHours(1), user));
        });
    }

    @Test void deletesAllPersonalLinksButPreservesCatalogAndOtherUsers() {
        User owner = create(UserRole.USER, UserStatus.ACTIVE);
        User other = create(UserRole.USER, UserStatus.ACTIVE);
        attach(owner);
        tx.executeWithoutResult(s -> userBooks.save(new UserBook(UserBookStatus.READING, true, null, null, null,
                other, books.findAll().getFirst())));
        delete(owner);
        assertFalse(users.existsById(owner.getId()));
        assertTrue(users.existsById(other.getId()));
        assertEquals(1, books.count());
        assertEquals(0, shelves.count()); assertEquals(0, items.count());
        assertEquals(0, ratings.count()); assertEquals(1, userBooks.count());
        assertEquals(1, authors.count()); assertEquals(1, categories.count());
        assertTrue(resets.findByTokenHash(resetHash()).isEmpty());
        var recovery = new com.joaocuculo.letterbooks.services.PasswordResetService(resets, users, encoder,
                org.mockito.Mockito.mock(com.joaocuculo.letterbooks.services.EmailService.class));
        assertThrows(com.joaocuculo.letterbooks.exceptions.InvalidTokenException.class,
                () -> recovery.resetPassword(new ResetPasswordRequestDTO("deleted-reset-token", "Newpass1!")));
    }

    @Test void emptyAccountCanBeDeletedAndOldTokenNoLongerAuthenticates() throws Exception {
        User owner = create(UserRole.USER, UserStatus.ACTIVE);
        var tokens = new TokenConfig();
        org.springframework.test.util.ReflectionTestUtils.setField(tokens, "secret", "isolated-test-secret-not-used-by-application");
        String token = tokens.generateToken(owner);
        delete(owner);
        var authorization = new com.joaocuculo.letterbooks.config.AuthorizationService(users);
        var filter = new SecurityFilter(tokens, authorization);
        var request = new org.springframework.mock.web.MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        filter.doFilter(request, new org.springframework.mock.web.MockHttpServletResponse(), (req, res) ->
                assertNull(org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication()));
    }

    @Test void inactiveAdministratorDoesNotCountAndNoDataIsRemoved() {
        User active = create(UserRole.ADMIN, UserStatus.ACTIVE);
        create(UserRole.ADMIN, UserStatus.INACTIVE);
        attach(active);
        assertThrows(BusinessException.class, () -> delete(active));
        assertEquals(2, users.count()); assertEquals(1, ratings.count()); assertEquals(1, items.count());
    }

    @Test void databaseFailureRollsBackEveryDeletedLink() {
        User owner = create(UserRole.USER, UserStatus.ACTIVE);
        attach(owner);
        jdbc.execute("create function fail_account_delete() returns trigger language plpgsql as $$ begin raise exception 'isolated failure'; end $$");
        jdbc.execute("create trigger fail_account_delete before delete on users for each row execute function fail_account_delete()");
        try {
            assertThrows(RuntimeException.class, () -> delete(owner));
            assertTrue(users.existsById(owner.getId()));
            assertEquals(1, items.count()); assertEquals(1, shelves.count());
            assertEquals(1, ratings.count()); assertEquals(1, userBooks.count()); assertEquals(1, resets.count());
        } finally {
            jdbc.execute("drop trigger fail_account_delete on users");
            jdbc.execute("drop function fail_account_delete()");
        }
    }

    @Test void concurrentSelfDeletionsLeaveOneActiveAdmin() throws Exception { race(null); }
    @Test void concurrentDeletionAndInactivationLeaveOneActiveAdmin() throws Exception { race(UserStatus.INACTIVE); }
    @Test void concurrentDeletionAndDemotionLeaveOneActiveAdmin() throws Exception { race(UserStatus.ACTIVE); }

    void race(UserStatus nextStatus) throws Exception {
        User first = create(UserRole.ADMIN, UserStatus.ACTIVE);
        User second = create(UserRole.ADMIN, UserStatus.ACTIVE);
        var barrier = new CyclicBarrier(2);
        var pool = Executors.newFixedThreadPool(2);
        try {
            Callable<Throwable> a = operation(barrier, () -> delete(first));
            Callable<Throwable> b = operation(barrier, () -> {
                if (nextStatus == null) delete(second);
                else service.updateRoleAndStatus(second.getId(), new UserStatusUpdateDTO(
                        nextStatus == UserStatus.INACTIVE ? UserRole.ADMIN : UserRole.USER, nextStatus), first.getId());
            });
            var futures = pool.invokeAll(List.of(a, b), 20, TimeUnit.SECONDS);
            var results = new ArrayList<Throwable>();
            for (var future : futures) results.add(future.get());
            assertEquals(1, results.stream().filter(Objects::isNull).count(), results.toString());
            Throwable rejected = results.stream().filter(Objects::nonNull).findFirst().orElseThrow();
            assertInstanceOf(ConcurrencyFailureException.class, rejected);
            assertEquals(1, jdbc.queryForObject("select count(*) from users where role='ADMIN' and status='ACTIVE'", Long.class));
        } finally { pool.shutdownNow(); }
    }

    Callable<Throwable> operation(CyclicBarrier barrier, Runnable action) {
        return () -> {
            var serial = new TransactionTemplate(manager);
            serial.setIsolationLevel(TransactionDefinition.ISOLATION_SERIALIZABLE);
            try {
                serial.executeWithoutResult(s -> {
                    jdbc.queryForObject("select count(*) from users where role='ADMIN' and status='ACTIVE'", Long.class);
                    try { barrier.await(10, TimeUnit.SECONDS); }
                    catch (Exception failure) { throw new RuntimeException(failure); }
                    action.run();
                });
                return null;
            } catch (Throwable failure) { return failure; }
        };
    }

    String resetHash() {
        try {
            return java.util.HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256")
                    .digest("deleted-reset-token".getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException e) { throw new AssertionError(e); }
    }
}
