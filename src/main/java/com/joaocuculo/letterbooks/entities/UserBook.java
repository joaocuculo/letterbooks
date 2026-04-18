package com.joaocuculo.letterbooks.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.joaocuculo.letterbooks.entities.enums.UserBookStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(
        name = "user_book",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "book_id"})
        }
)
public class UserBook implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserBookStatus status;

    private boolean isFavorite;

    private Integer currentPage;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    public UserBook() {
    }

    public UserBook(UserBookStatus status, boolean isFavorite, Integer currentPage, LocalDateTime startedAt, LocalDateTime finishedAt, User user, Book book) {
        this.status = status;
        this.isFavorite = isFavorite;
        this.currentPage = currentPage;
        this.startedAt = startedAt;
        this.finishedAt = finishedAt;
        this.user = user;
        this.book = book;
    }

    public Long getId() {
        return id;
    }

    public UserBookStatus getStatus() {
        return status;
    }

    public void setStatus(UserBookStatus status) {
        this.status = status;
    }

    public boolean isFavorite() {
        return isFavorite;
    }

    public void setFavorite(boolean favorite) {
        isFavorite = favorite;
    }

    public Integer getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(Integer currentPage) {
        this.currentPage = currentPage;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getFinishedAt() {
        return finishedAt;
    }

    public void setFinishedAt(LocalDateTime finishedAt) {
        this.finishedAt = finishedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public User getUser() {
        return user;
    }

    public Book getBook() {
        return book;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        UserBook userBook = (UserBook) o;
        return Objects.equals(getId(), userBook.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }
}
