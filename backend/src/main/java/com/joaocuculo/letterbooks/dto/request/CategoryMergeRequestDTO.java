package com.joaocuculo.letterbooks.dto.request;

import jakarta.validation.constraints.NotNull;

public record CategoryMergeRequestDTO(
        @NotNull
        Long targetCategoryId,
        @NotNull
        Long sourceCategoryId
) {
}
