package com.joaocuculo.letterbooks.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.joaocuculo.letterbooks.entities.enums.MaturityRating;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "books")
public class Book implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String googleBooksId;

    @Column(nullable = false)
    private String title;

    private String subtitle;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String publisher;
    private String publishedDate;
    private Integer publishedYear;
    private String imageUrl;
    private String thumbnailUrl;
    private Integer pageCount;
    private String language;
    private String isbn;

    @Enumerated(EnumType.STRING)
    private MaturityRating maturityRating;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToMany
    @JoinTable(
            name = "book_category",
            joinColumns = @JoinColumn(name = "book_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "book_author",
            joinColumns = @JoinColumn(name = "book_id"),
            inverseJoinColumns = @JoinColumn(name = "author_id")
    )
    private Set<Author> authors = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "book")
    private Set<Rating> ratings = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "book")
    private Set<UserBook> userBooks = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "id.book")
    private Set<BookshelfItem> items = new HashSet<>();

    public Book() {
    }

    public Book(String googleBooksId, String title, String subtitle, String description, String publisher, String publishedDate, Integer publishedYear, String imageUrl, String thumbnailUrl, Integer pageCount, String language, String isbn, MaturityRating maturityRating) {
        this.googleBooksId = googleBooksId;
        this.title = title;
        this.subtitle = subtitle;
        this.description = description;
        this.publisher = publisher;
        this.publishedDate = publishedDate;
        this.publishedYear = publishedYear;
        this.imageUrl = imageUrl;
        this.thumbnailUrl = thumbnailUrl;
        this.pageCount = pageCount;
        this.language = language;
        this.isbn = isbn;
        this.maturityRating = maturityRating;
    }

    public Long getId() {
        return id;
    }

    public String getGoogleBooksId() {
        return googleBooksId;
    }

    public void setGoogleBooksId(String googleBooksId) {
        this.googleBooksId = googleBooksId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPublisher() {
        return publisher;
    }

    public void setPublisher(String publisher) {
        this.publisher = publisher;
    }

    public String getPublishedDate() {
        return publishedDate;
    }

    public void setPublishedDate(String publishedDate) {
        this.publishedDate = publishedDate;
    }

    public Integer getPublishedYear() {
        return publishedYear;
    }

    public void setPublishedYear(Integer publishedYear) {
        this.publishedYear = publishedYear;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public Integer getPageCount() {
        return pageCount;
    }

    public void setPageCount(Integer pageCount) {
        this.pageCount = pageCount;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public MaturityRating getMaturityRating() {
        return maturityRating;
    }

    public void setMaturityRating(MaturityRating maturityRating) {
        this.maturityRating = maturityRating;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Set<Category> getCategories() {
        return categories;
    }

    public Set<Author> getAuthors() {
        return authors;
    }

    public Set<Rating> getRatings() {
        return ratings;
    }

    public Set<UserBook> getUserBooks() {
        return userBooks;
    }

    public Set<BookshelfItem> getItems() {
        return items;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Book book = (Book) o;
        return Objects.equals(getId(), book.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }
}
