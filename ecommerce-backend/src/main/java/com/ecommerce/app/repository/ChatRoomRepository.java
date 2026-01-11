package com.ecommerce.app.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.app.entities.ChatRoom;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    // Guest users
    Optional<ChatRoom> findBySessionId(String sessionId);
    boolean existsBySessionId(String sessionId);

    // Logged-in users
    Optional<ChatRoom> findByUserId(Long userId);

    // Admin dashboard
    Page<ChatRoom> findByClosedFalse(Pageable pageable);
    List<ChatRoom> findByClosedFalse();
}


