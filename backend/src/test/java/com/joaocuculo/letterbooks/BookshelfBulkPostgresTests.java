package com.joaocuculo.letterbooks;

import com.joaocuculo.letterbooks.dto.external.GoogleBooksResponseDTO;
import com.joaocuculo.letterbooks.dto.request.BookshelfBulkRequestDTO;
import com.joaocuculo.letterbooks.entities.*;
import com.joaocuculo.letterbooks.entities.enums.*;
import com.joaocuculo.letterbooks.exceptions.*;
import com.joaocuculo.letterbooks.repositories.*;
import com.joaocuculo.letterbooks.services.*;
import jakarta.persistence.EntityManagerFactory;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.*;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.orm.jpa.*;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.transaction.*;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.support.TransactionTemplate;
import javax.sql.DataSource;
import java.util.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@EnabledIfSystemProperty(named = "bulk.test.url", matches = ".+")
@SpringJUnitConfig(BookshelfBulkPostgresTests.Config.class)
class BookshelfBulkPostgresTests {
    @Configuration @EnableTransactionManagement
    @EnableJpaRepositories(basePackages = "com.joaocuculo.letterbooks.repositories")
    static class Config {
        @Bean DataSource dataSource() {
            String url=System.getProperty("bulk.test.url");
            if (!url.matches("jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/letterbooks_bulk_test"))
                throw new IllegalArgumentException("Use only the isolated local bulk test database.");
            return new DriverManagerDataSource(url,"codex_bulk","");
        }
        @Bean LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource source) {
            var bean=new LocalContainerEntityManagerFactoryBean(); bean.setDataSource(source);
            bean.setPackagesToScan("com.joaocuculo.letterbooks.entities");bean.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
            bean.setJpaPropertyMap(Map.of("hibernate.hbm2ddl.auto","create-drop"));return bean;
        }
        @Bean PlatformTransactionManager transactionManager(EntityManagerFactory factory) { return new JpaTransactionManager(factory); }
        @Bean GoogleBooksService google() { return mock(GoogleBooksService.class); }
        @Bean UserService users(UserRepository repository) {
            var service=mock(UserService.class);
            when(service.getByIdOrThrow(anyLong())).thenAnswer(call->repository.findById(call.getArgument(0)).orElseThrow());
            return service;
        }
        @Bean AuthorService authors(AuthorRepository authors,BookRepository books,AuthorNameRepository names) { return new AuthorService(authors,books,names); }
        @Bean CategoryService categories(CategoryRepository categories,BookRepository books,CategoryNameRepository names) { return new CategoryService(categories,books,names); }
        @Bean BookService catalog(BookRepository books,GoogleBooksService google,AuthorService authors,CategoryService categories,UserBookRepository library) {
            return new BookService(books,google,authors,categories,library,mock(RatingSummaryService.class));
        }
        @Bean UserBookService library(UserBookRepository repository,UserService users,BookService catalog) { return spy(new UserBookService(repository,users,catalog)); }
        @Bean BookshelfService shelves(BookshelfRepository repository,UserService users,BookshelfItemRepository items,UserBookRepository library) {
            return new BookshelfService(repository,users,items,library);
        }
        @Bean BookshelfBulkService bulk(BookshelfService shelves,BookRepository books,BookService catalog,GoogleBooksService google,
                UserBookService library,BookshelfItemRepository items,PlatformTransactionManager manager) {
            return new BookshelfBulkService(shelves,books,catalog,google,library,items,manager);
        }
    }
    @Autowired BookshelfBulkService bulk;
    @Autowired UserRepository users;
    @Autowired BookRepository books;
    @Autowired BookshelfRepository shelves;
    @Autowired BookshelfItemRepository items;
    @Autowired UserBookRepository library;
    @Autowired AuthorRepository authors;
    @Autowired CategoryRepository categories;
    @Autowired GoogleBooksService google;
    @Autowired UserBookService libraryService;
    @Autowired DataSource source;
    @Autowired PlatformTransactionManager manager;
    TransactionTemplate tx;
    User owner;
    Bookshelf target;
    @BeforeEach void clean() {
        new JdbcTemplate(source).execute("truncate table users, books, authors, categories restart identity cascade");
        reset(google,libraryService);tx=new TransactionTemplate(manager);
        owner=tx.execute(s->users.save(new User("Leitor","bulk@example.test","hash",UserRole.USER,UserStatus.ACTIVE)));
        target=tx.execute(s->shelves.save(new Bookshelf("Destino",null,false,owner)));
    }
    Book local(String id) { return tx.execute(s->books.save(new Book(id,id,null,null,null,null,null,null,null,null,null,null,null))); }
    BookshelfBulkRequestDTO request(String... ids) { return new BookshelfBulkRequestDTO(List.of(ids),List.of(target.getId())); }
    GoogleBooksResponseDTO external(String id) {
        return new GoogleBooksResponseDTO(id,new GoogleBooksResponseDTO.VolumeInfo(id,null,List.of("Autor do lote"),null,null,
                null,null,null,List.of("Categoria do lote"),null,null,null));
    }
    @Test void isIdempotentAndPreservesExistingStatusAndFavorite() {
        var a=local("a");local("b");
        tx.executeWithoutResult(s->library.save(new UserBook(UserBookStatus.READING,true,42,null,null,owner,a)));
        var first=bulk.add(request("a","b"),owner.getId());
        assertEquals(2,first.shelves().getFirst().addedCount());
        var second=bulk.add(request("a","b"),owner.getId());
        assertEquals(0,second.shelves().getFirst().addedCount());assertEquals(2,second.shelves().getFirst().alreadyPresentCount());
        assertEquals(2,items.count());assertEquals(2,library.count());
        var existing=library.findByUserIdAndBookGoogleBooksId(owner.getId(),"a").orElseThrow();
        assertEquals(UserBookStatus.READING,existing.getStatus());assertTrue(existing.isFavorite());assertEquals(42,existing.getCurrentPage());
        assertEquals(UserBookStatus.WANT_TO_READ,library.findByUserIdAndBookGoogleBooksId(owner.getId(),"b").orElseThrow().getStatus());
        verifyNoInteractions(google);
    }
    @Test void summaryDoesNotCreateCatalogAndRejectsOtherOwners() {
        var a=local("a");tx.executeWithoutResult(s->items.save(new BookshelfItem(target,a)));
        assertEquals(1,bulk.summary(request("a","unknown"),owner.getId()).shelves().getFirst().existingCount());
        assertEquals(1,books.count());assertEquals(0,library.count());verifyNoInteractions(google);
        var other=tx.execute(s->users.save(new User("Outro","other@example.test","hash",UserRole.USER,UserStatus.ACTIVE)));
        assertThrows(ForbiddenException.class,()->bulk.add(request("new"),other.getId()));
        assertThrows(ResourceNotFoundException.class,()->bulk.summary(new BookshelfBulkRequestDTO(List.of("a"),List.of(99999L)),owner.getId()));
        verifyNoInteractions(google);
    }
    @Test void rollsBackCatalogAuthorsCategoriesLibraryAndShelfLinksOnWriteFailure() {
        when(google.findByGoogleBooksId(anyString())).thenAnswer(call->external(call.getArgument(0)));
        doAnswer(call->{ Book book=call.getArgument(1); if(book.getGoogleBooksId().equals("z-bad"))throw new IllegalStateException("simulated write failure");return call.callRealMethod(); })
                .when(libraryService).ensureInLibrary(eq(owner.getId()),any(Book.class));
        assertThrows(IllegalStateException.class,()->bulk.add(request("a-good","z-bad"),owner.getId()));
        assertEquals(0,books.count());assertEquals(0,authors.count());assertEquals(0,categories.count());
        assertEquals(0,library.count());assertEquals(0,items.count());assertEquals(1,shelves.count());
    }
    @Test void unavailableExternalBookLeavesNoPartialCatalog() {
        when(google.findByGoogleBooksId("a")).thenReturn(external("a"));
        when(google.findByGoogleBooksId("b")).thenThrow(new ExternalServiceException("unavailable"));
        assertThrows(ExternalServiceException.class,()->bulk.add(request("a","b"),owner.getId()));
        assertEquals(0,books.count());assertEquals(0,items.count());assertEquals(0,library.count());
    }
    @Test void createsExternalCatalogAndDefaultPersonalRelationshipTogether() {
        when(google.findByGoogleBooksId("new")).thenReturn(external("new"));
        assertEquals(1,bulk.add(request("new"),owner.getId()).shelves().getFirst().addedCount());
        assertEquals(1,books.count());assertEquals(1,authors.count());assertEquals(1,categories.count());assertEquals(1,items.count());
        var relation=library.findByUserIdAndBookGoogleBooksId(owner.getId(),"new").orElseThrow();
        assertEquals(UserBookStatus.WANT_TO_READ,relation.getStatus());assertFalse(relation.isFavorite());
    }
    @Test void revalidatesDestinationsAfterExternalPreparation() {
        when(google.findByGoogleBooksId("new")).thenAnswer(call->{
            tx.executeWithoutResult(status->shelves.deleteById(target.getId())); return external("new");
        });
        assertThrows(ResourceNotFoundException.class,()->bulk.add(request("new"),owner.getId()));
        assertEquals(0,books.count());assertEquals(0,items.count());assertEquals(0,library.count());
    }
    @ParameterizedTest @ValueSource(booleans = {false,true})
    void concurrentRequestsDoNotDuplicateCatalogPersonalOrShelfLinks(boolean external) throws Exception {
        if(external)when(google.findByGoogleBooksId("shared")).thenReturn(external("shared"));else local("shared");
        var gate=new CountDownLatch(1);
        try(var executor=Executors.newFixedThreadPool(2)) {
            Callable<Integer> action=()->{gate.await();return bulk.add(request("shared"),owner.getId()).shelves().getFirst().addedCount();};
            var first=executor.submit(action);var second=executor.submit(action);gate.countDown();
            assertEquals(1,first.get(20,TimeUnit.SECONDS)+second.get(20,TimeUnit.SECONDS));
        }
        assertEquals(1,items.count());assertEquals(1,library.count());assertEquals(1,books.count());
    }
}
