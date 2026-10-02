package com.joaocuculo.letterbooks.utils;

import java.text.Normalizer;
import java.util.Locale;

import com.joaocuculo.letterbooks.exceptions.BusinessException;

public final class NameNormalizer {
    
    private NameNormalizer() {
    }

    public static String normalize(String rawName) {
        String normalizedName = Normalizer.normalize(rawName, Normalizer.Form.NFD) // separa os acentos das letras
                .replaceAll("\\p{M}", "") // remove os acentos
                .replaceAll("[^a-zA-Z0-9\\s]", "") // remove os caracteres especiais
                .replaceAll("\\s+", " ")
                .trim()
                .toLowerCase(Locale.ROOT);

        if (normalizedName.isBlank()) {
            throw new BusinessException("Nome deve possuir caracteres válidos.");
        }

        return normalizedName;
    }
}
