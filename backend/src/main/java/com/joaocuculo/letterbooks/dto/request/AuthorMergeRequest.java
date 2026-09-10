package com.joaocuculo.letterbooks.dto.request;

import jakarta.validation.constraints.NotNull;

public record AuthorMergeRequest(
        @NotNull 
        Long targetAuthorId,
        @NotNull 
        Long sourceAuthorId
        ) {
}
