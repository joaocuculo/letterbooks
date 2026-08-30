package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.client.GoogleBooksClient;
import com.joaocuculo.letterbooks.dto.external.GoogleBooksResponseDTO;
import com.joaocuculo.letterbooks.dto.external.GoogleBooksSearchResponseDTO;
import com.joaocuculo.letterbooks.dto.response.BookCardResponseDTO;
import com.joaocuculo.letterbooks.dto.response.DiscoverResponseDTO;
import com.joaocuculo.letterbooks.dto.response.DiscoverSectionDTO;
import com.joaocuculo.letterbooks.entities.UserBook;
import com.joaocuculo.letterbooks.mapper.BookMapper;
import com.joaocuculo.letterbooks.repositories.UserBookRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DiscoverService {

    private static final Logger log = LoggerFactory.getLogger(DiscoverService.class);
    private final GoogleBooksClient googleBooksClient;
    private final UserBookRepository userBookRepository;
    private static final List<SectionDefinition> SECTIONS = List.of(
            new SectionDefinition("fiction", "Ficção", "subject:fiction"),
            new SectionDefinition("technology", "Tecnologia", "subject:technology"),
            new SectionDefinition("biographies", "Biografias", "subject:biographies")
    );

    public DiscoverService(GoogleBooksClient googleBooksClient, UserBookRepository userBookRepository) {
        this.googleBooksClient = googleBooksClient;
        this.userBookRepository = userBookRepository;
    }

    public DiscoverResponseDTO discover(Long userId) {
        List<DiscoverSectionDTO> sections = SECTIONS.stream()
                .map(def -> loadSection(def, userId))
                .flatMap(Optional::stream)
                .toList();
        return new DiscoverResponseDTO(sections);
    }

    private Optional<DiscoverSectionDTO> loadSection(SectionDefinition definition, Long userId) {
        try {
            GoogleBooksSearchResponseDTO response = googleBooksClient.search(definition.query(), 10, 0);
            if (response == null || response.items() == null) {
                log.warn("Não foi possível carregar a seção: {}", definition.key());
                return Optional.empty();
            }

            List<GoogleBooksResponseDTO> items = response.items();
            Map<String, UserBook> userBooksByGoogleId = resolveUserBooks(userId, items);

            List<BookCardResponseDTO> books = items.stream()
                    .map(item -> {
                       UserBook userBook = userBooksByGoogleId.get(item.googleBooksId());
                       return BookMapper.toCardResponseDTO(
                               item,
                               userBook != null && userBook.isFavorite(),
                               userBook != null ? userBook.getId() : null
                       );
                    })
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

    private Map<String, UserBook> resolveUserBooks(Long userId, List<GoogleBooksResponseDTO> items) {
        if (userId == null) {
            return Map.of();
        }
        List<String> googleBooksIds = items.stream()
                .map(GoogleBooksResponseDTO::googleBooksId)
                .toList();
        return userBookRepository.findByUserIdAndBookGoogleBooksIdIn(userId, googleBooksIds).stream()
                .collect(Collectors.toMap(ub -> ub.getBook().getGoogleBooksId(), ub -> ub));
    }

    private record SectionDefinition(
            String key,
            String title,
            String query
    ){
    }
}
