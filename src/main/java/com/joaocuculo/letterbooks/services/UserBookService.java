package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.dto.response.UserBookResponseDTO;
import com.joaocuculo.letterbooks.entities.UserBook;
import com.joaocuculo.letterbooks.entities.enums.UserBookStatus;
import com.joaocuculo.letterbooks.mapper.UserBookMapper;
import com.joaocuculo.letterbooks.repositories.UserBookRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class UserBookService {

    private final UserBookRepository userBookRepository;

    public UserBookService(UserBookRepository userBookRepository) {
        this.userBookRepository = userBookRepository;
    }

    public Page<UserBookResponseDTO> findByUserId(Long id, UserBookStatus status, Pageable pageable) {
        Page<UserBook> userBooks;
        if (status == null) {
            userBooks = userBookRepository.findByUserId(id, pageable);
        } else {
            userBooks = userBookRepository.findByUserIdAndStatus(id, status, pageable);
        }
        return userBooks.map(UserBookMapper::toResponseDTO);
    }
}
