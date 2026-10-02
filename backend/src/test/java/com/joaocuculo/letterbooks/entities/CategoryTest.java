package com.joaocuculo.letterbooks.entities;

import com.joaocuculo.letterbooks.exceptions.BusinessException;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CategoryTest {

    @Test
    void shouldAddPrimaryName() {
        Category category = new Category();

        CategoryName primaryName = category.addPrimaryName("Ficção científica", "ficcao cientifica");

        assertEquals("Ficção científica", category.getPrimaryName());
        assertTrue(primaryName.isPrimary());
        assertSame(category, primaryName.getCategory());
    }

    @Test
    void shouldRejectSecondPrimaryName() {
        Category category = categoryWithPrimaryName();

        assertThrows(
                BusinessException.class,
                () -> category.addPrimaryName("Science Fiction", "science fiction")
        );
    }

    @Test
    void shouldRequirePrimaryNameBeforeAlternativeName() {
        Category category = new Category();

        assertThrows(
                BusinessException.class,
                () -> category.addAlternativeName("Science Fiction", "science fiction")
        );
    }

    @Test
    void shouldRejectDuplicatedNormalizedName() {
        Category category = categoryWithPrimaryName();

        assertThrows(
                BusinessException.class,
                () -> category.addAlternativeName("Ficcao cientifica", "ficcao cientifica")
        );
    }

    @Test
    void shouldChangePrimaryName() throws ReflectiveOperationException {
        Category category = categoryWithPrimaryName();
        CategoryName oldPrimaryName = category.getCategoryNames().getFirst();
        CategoryName newPrimaryName = category.addAlternativeName("Science Fiction", "science fiction");
        setId(newPrimaryName, 2L);

        category.changePrimaryName(2L);

        assertFalse(oldPrimaryName.isPrimary());
        assertTrue(newPrimaryName.isPrimary());
        assertEquals("Science Fiction", category.getPrimaryName());
    }

    @Test
    void shouldRejectPrimaryNameRemoval() throws ReflectiveOperationException {
        Category category = categoryWithPrimaryName();
        CategoryName primaryName = category.getCategoryNames().getFirst();
        setId(primaryName, 1L);

        assertThrows(BusinessException.class, () -> category.removeName(1L));
    }

    @Test
    void shouldAbsorbSourceNamesAsAlternatives() {
        Category target = categoryWithPrimaryName();
        Category source = new Category();
        source.addPrimaryName("Science Fiction", "science fiction");
        source.addAlternativeName("Sci-Fi", "scifi");

        target.absorbNamesFrom(source);

        assertEquals(3, target.getCategoryNames().size());
        assertTrue(target.getCategoryNames().stream()
                .filter(name -> name.getCategory() == target)
                .allMatch(name -> name.getName().equals("Ficção científica") || !name.isPrimary()));
        assertTrue(source.getCategoryNames().isEmpty());
    }

    @Test
    void shouldNotConsiderTransientCategoriesEqual() {
        assertNotEquals(new Category(), new Category());
    }

    @Test
    void shouldNotExposeModifiableNamesList() {
        Category category = categoryWithPrimaryName();

        assertThrows(
                UnsupportedOperationException.class,
                () -> category.getCategoryNames().clear()
        );
    }

    private Category categoryWithPrimaryName() {
        Category category = new Category();
        category.addPrimaryName("Ficção científica", "ficcao cientifica");
        return category;
    }

    private void setId(CategoryName categoryName, Long id) throws ReflectiveOperationException {
        Field idField = CategoryName.class.getDeclaredField("id");
        idField.setAccessible(true);
        idField.set(categoryName, id);
    }
}
