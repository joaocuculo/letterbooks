from pathlib import Path
p=Path('frontend/src/styles/book-details.css');s=p.read_text(encoding='utf-8')
# Remove styles for the retired comparison compositions.
a=s.index('.book-models {');b=s.index('.book-layout {',a);s=s[:a]+s[b:]
a=s.index('.book-layout-presentation {');b=s.index('@media (max-width: 1023px)',a);s=s[:a]+s[b:]
s=s.replace('    .book-layout-library,\n    .book-layout-presentation,\n    .book-layout-editorial {','    .book-layout-library {')
import re
s=re.sub(r'    \.book-layout-(?:presentation|editorial)[^{]*\{[^}]*\}\n','',s)
s=re.sub(r'    \.book-models[^\{]*\{[^}]*\}\n','',s)
s=s.replace('    .book-metadata dl,\n    .book-layout-presentation .book-metadata dl {','    .book-metadata dl {')
s=s.replace('    max-height: calc(100dvh - 80px);','    height: min(800px, calc(100dvh - 80px));\n    max-height: calc(100dvh - 80px);')
p.write_text(s,encoding='utf-8')
Path('backend/src/test/java/com/joaocuculo/letterbooks/BookshelfMembershipTests.java').write_text('''package com.joaocuculo.letterbooks;

import com.joaocuculo.letterbooks.config.JWTUserData;
import com.joaocuculo.letterbooks.controllers.BookshelfController;
import com.joaocuculo.letterbooks.dto.response.BookshelfMembershipDTO;
import com.joaocuculo.letterbooks.entities.enums.UserRole;
import com.joaocuculo.letterbooks.repositories.BookshelfRepository;
import com.joaocuculo.letterbooks.services.*;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BookshelfMembershipTests {
    @Test
    void queriesOnlyAuthenticatedUsersMembershipsWithoutPersistingBooks() {
        var repository = mock(BookshelfRepository.class);
        var users = mock(UserService.class);
        var items = mock(BookshelfItemService.class);
        var controller = new BookshelfController(new BookshelfService(repository, users), items);
        var expected = List.of(new BookshelfMembershipDTO(7L, "Clássicos"));
        when(repository.findMembershipsByUserIdAndGoogleBooksId(42L, "duna")).thenReturn(expected);
        var result = controller.findMineByGoogleBooksId("duna", new JWTUserData(42L, "test@example.com", UserRole.USER, 0));
        assertEquals(expected, result.getBody());
        verify(repository).findMembershipsByUserIdAndGoogleBooksId(42L, "duna");
        verifyNoMoreInteractions(repository);
        verifyNoInteractions(users, items);
    }

    @Test
    void returnsEmptyMembershipsForAnUnpersistedBook() {
        var repository = mock(BookshelfRepository.class);
        when(repository.findMembershipsByUserIdAndGoogleBooksId(42L, "unknown")).thenReturn(List.of());
        var service = new BookshelfService(repository, mock(UserService.class));
        assertTrue(service.findMineByGoogleBooksId(42L, "unknown").isEmpty());
    }
}
''',encoding='utf-8')
