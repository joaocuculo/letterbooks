package com.joaocuculo.letterbooks;

import com.joaocuculo.letterbooks.entities.*;
import com.joaocuculo.letterbooks.entities.enums.*;
import com.joaocuculo.letterbooks.repositories.RatingRepository;
import com.joaocuculo.letterbooks.mapper.RatingMapper;
import jakarta.persistence.*;
import org.hibernate.SessionFactory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.transaction.annotation.Transactional;
import static org.junit.jupiter.api.Assertions.*;

@EnabledIfSystemProperty(named="ratings.test.url", matches=".+")
@SpringJUnitConfig(RatingAveragePostgresTests.Config.class)
@Transactional
class RatingHistoryPostgresTests {
    @Autowired EntityManager em;
    @Autowired EntityManagerFactory factory;
    @Autowired RatingRepository ratings;

    @Test void paginatesOnlyOwnerCaseInsensitivelyWithTwoQueriesIncludingMapping() {
        var owner = new User("Reader", "reader@example.test", "unused", UserRole.USER, UserStatus.ACTIVE);
        var other = new User("Other", "other@example.test", "unused", UserRole.USER, UserStatus.ACTIVE);
        em.persist(owner); em.persist(other);
        for (int i=0;i<6;i++) {
            var book = new Book(); book.setTitle("Memórias " + i); book.setGoogleBooksId("history-"+i); em.persist(book);
            em.persist(new Rating(i % 6, i % 2 == 0 ? null : "Comentário", owner, book));
            em.persist(new Rating(5, "Other user", other, book));
        }
        em.flush(); em.clear();
        var stats = factory.unwrap(SessionFactory.class).getStatistics(); stats.clear();
        var first = ratings.searchByUserId(owner.getId(), "%MEMÓRIAS%", PageRequest.of(0,2,Sort.by(Sort.Order.desc("score"),Sort.Order.desc("id"))));
        var mapped = first.map(RatingMapper::toResponseDTO);
        assertEquals(6, mapped.getTotalElements()); assertEquals(3,mapped.getTotalPages());
        assertEquals(5,mapped.getContent().getFirst().score());
        assertTrue(mapped.stream().allMatch(r -> r.user().id().equals(owner.getId())));
        assertEquals(2,stats.getPrepareStatementCount());
        var second = ratings.searchByUserId(owner.getId(), "%memórias%", PageRequest.of(1,2,Sort.by(Sort.Order.desc("score"),Sort.Order.desc("id"))));
        assertEquals(3,second.getContent().getFirst().getScore());
        assertTrue(ratings.searchByUserId(owner.getId(), "%missing%",PageRequest.of(0,20)).isEmpty());
        assertEquals(6L,em.createQuery("select count(b) from Book b",Long.class).getSingleResult());
    }
}
