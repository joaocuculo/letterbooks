package com.joaocuculo.utils;

import java.text.Normalizer;
import java.util.Locale;

public final class NameNormalizer {
    
    private NameNormalizer() {
    }

    public static String normalize(String rawName) {
        return Normalizer.normalize(rawName, Normalizer.Form.NFD) // separa os acentos das letras
                .replaceAll("\\p{M}", "") // remove os acentos
                .replaceAll("[^a-zA-Z0-9\\s]", "") // remove os caracteres especiais
                .replaceAll("\\s+", " ")
                .trim()
                .toLowerCase(Locale.ROOT);
    }
}
