package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.client.GoogleBooksClient;
import com.joaocuculo.letterbooks.dto.external.GoogleBooksSearchResponseDTO;
import com.joaocuculo.letterbooks.dto.response.BookCardResponseDTO;
import com.joaocuculo.letterbooks.dto.response.DiscoverResponseDTO;
import com.joaocuculo.letterbooks.dto.response.DiscoverSectionDTO;
import com.joaocuculo.letterbooks.mapper.BookMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DiscoverService {

    private static final Logger log = LoggerFactory.getLogger(DiscoverService.class);
    private final GoogleBooksClient googleBooksClient;
    private static final List<SectionDefinition> SECTIONS = List.of(
            new SectionDefinition("fiction", "Ficção", "subject:fiction"),
            new SectionDefinition("technology", "Tecnologia", "subject:technology"),
            new SectionDefinition("biographies", "Biografias", "subject:biographies")
    );

    public DiscoverService(GoogleBooksClient googleBooksClient) {
        this.googleBooksClient = googleBooksClient;
    }

    public DiscoverResponseDTO discover() {
        List<DiscoverSectionDTO> sections = SECTIONS.stream()
                .map(this::loadSection)
                .flatMap(Optional::stream)
                .toList();
        return new DiscoverResponseDTO(sections);
    }

    private Optional<DiscoverSectionDTO> loadSection(SectionDefinition definition) {
        try {
            GoogleBooksSearchResponseDTO response = googleBooksClient.search(definition.query(), 10, 0);
            if (response == null || response.items() == null) {
                log.warn("Não foi possível carregar a seção: {}", definition.key());
                return Optional.empty();
            }

            List<BookCardResponseDTO> books = response.items().stream()
                    .map(BookMapper::toCardResponseDTO)
                    .toList();

            return Optional.of(new DiscoverSectionDTO(
                    definition.key(),
                    definition.title(),
                    books
            ));
        } catch (Exception exception) {
            log.warn(
                    "Erro ao carregar a seção: {}",
                    definition.key(),
                    exception
            );
            return Optional.empty();
        }
    }

    private record SectionDefinition(
            String key,
            String title,
            String query
    ){
    }
}
