package com.joaocuculo.letterbooks.entities.enums;

public enum UserStatus {

    ACTIVE("active"),
    INACTIVE("inactive");

    private String status;

    UserStatus(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }
}
