package com.joaocuculo.letterbooks.entities.enums;

public enum UserStatus {

    ACTIVE("Ativo"),
    INACTIVE("Inativo");

    private String status;

    UserStatus(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }
}
