package com.joaocuculo.letterbooks.dto.request;

import jakarta.validation.constraints.NotNull;

public record AuthorMergeRequestDTO(
        @NotNull 
        Long targetAuthorId,
        @NotNull 
        Long sourceAuthorId
        ) {
}
