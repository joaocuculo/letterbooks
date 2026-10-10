from pathlib import Path
p=Path('backend/src/test/java/com/joaocuculo/letterbooks/BookshelfMembershipTests.java')
p.write_text('''package com.joaocuculo.letterbooks;

import com.joaocuculo.letterbooks.config.JWTUserData;
import com.joaocuculo.letterbooks.controllers.BookshelfController;
import com.joaocuculo.letterbooks.dto.response.BookshelfMembershipDTO;
import com.joaocuculo.letterbooks.entities.enums.UserRole;
import com.joaocuculo.letterbooks.repositories.BookshelfRepository;
import com.joaocuculo.letterbooks.services.BookshelfService;
import org.junit.jupiter.api.Test;
import java.lang.reflect.Proxy;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class BookshelfMembershipTests {
    @Test
    void usesAuthenticatedUserAndDoesNotRequestOtherRepositoryOperations() {
        var expected = List.of(new BookshelfMembershipDTO(7L, "Clássicos"));
        var repository = repositoryReturning(expected, 42L, "duna");
        var controller = new BookshelfController(new BookshelfService(repository, null), null);
        var result = controller.findMineByGoogleBooksId("duna",
                new JWTUserData(42L, "test@example.com", UserRole.USER, 0));
        assertEquals(expected, result.getBody());
    }

    @Test
    void returnsEmptyMembershipsForAnUnpersistedBook() {
        var service = new BookshelfService(repositoryReturning(List.of(), 42L, "unknown"), null);
        assertTrue(service.findMineByGoogleBooksId(42L, "unknown").isEmpty());
    }

    private BookshelfRepository repositoryReturning(List<BookshelfMembershipDTO> result, Long userId, String googleBooksId) {
        // Intercepta apenas a leitura esperada; qualquer tentativa de persistência falha o teste.
        return (BookshelfRepository) Proxy.newProxyInstance(BookshelfRepository.class.getClassLoader(),
                new Class<?>[]{BookshelfRepository.class}, (proxy, method, arguments) -> {
                    assertEquals("findMembershipsByUserIdAndGoogleBooksId", method.getName());
                    assertEquals(userId, arguments[0]);
                    assertEquals(googleBooksId, arguments[1]);
                    return result;
                });
    }
}
''',encoding='utf-8')
