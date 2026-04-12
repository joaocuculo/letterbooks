package com.joaocuculo.letterbooks.entities;

import com.joaocuculo.letterbooks.entities.enums.UserBookStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "users_book")
public class UserBook implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserBookStatus status;

    @Column(nullable = false)
    private Boolean isFavorite;

    private Integer currentPage;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public UserBook() {
    }

    public UserBook(UserBookStatus status, Boolean isFavorite, Integer currentPage, LocalDateTime startedAt, LocalDateTime finishedAt) {
        this.status = status;
        this.isFavorite = isFavorite;
        this.currentPage = currentPage;
        this.startedAt = startedAt;
        this.finishedAt = finishedAt;
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

    public Boolean isFavorite() {
        return isFavorite;
    }

    public void setFavorite(Boolean favorite) {
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
