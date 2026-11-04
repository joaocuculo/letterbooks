package com.joaocuculo.letterbooks.dto.response;

import java.util.List;

public record BookshelfBulkResultDTO(int booksCount, List<Shelf> shelves) {
    public record Shelf(Long bookshelfId, int addedCount, int alreadyPresentCount) {}
}
