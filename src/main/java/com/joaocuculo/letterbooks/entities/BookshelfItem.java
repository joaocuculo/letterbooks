package com.joaocuculo.letterbooks.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.joaocuculo.letterbooks.entities.pk.BookshelfItemPK;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "bookshelf_item")
public class BookshelfItem implements Serializable {

    @EmbeddedId
    private BookshelfItemPK id = new BookshelfItemPK();

    @CreationTimestamp
    @Column(nullable = false)
    private LocalDateTime addedAt;

    public BookshelfItem() {
    }

    public BookshelfItem(Bookshelf bookshelf, Book book) {
        id.setBookshelf(bookshelf);
        id.setBook(book);
    }

    public Bookshelf getBookshelf() {
        return id.getBookshelf();
    }

    public void setBookshelf(Bookshelf bookshelf) {
        id.setBookshelf(bookshelf);
    }

    public Book getBook() {
        return id.getBook();
    }

    public void setBook(Book book) {
        id.setBook(book);
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        BookshelfItem that = (BookshelfItem) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
