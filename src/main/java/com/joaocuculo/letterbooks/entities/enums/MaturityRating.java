package com.joaocuculo.letterbooks.entities.enums;

public enum MaturityRating {

    NOT_MATURE("not_mature"),
    MATURE("mature");

    private String maturityRating;

    MaturityRating(String maturityRating) {
        this.maturityRating = maturityRating;
    }

    public String getMaturityRating() {
        return maturityRating;
    }
}
