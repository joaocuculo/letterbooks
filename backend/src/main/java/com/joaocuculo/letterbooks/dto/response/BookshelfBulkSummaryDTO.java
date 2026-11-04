package com.joaocuculo.letterbooks.dto.response;

import java.util.List;

public record BookshelfBulkSummaryDTO(int booksCount, List<Shelf> shelves) {
    public record Shelf(Long bookshelfId, int existingCount) {}
}
