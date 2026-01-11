package com.ecommerce.app.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.app.ENUM.MessageStatus;
import com.ecommerce.app.entities.ChatMessage;
import com.ecommerce.app.entities.ChatRoom;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByChatRoomOrderBySentAtAsc(ChatRoom chatRoom);
    Page<ChatMessage> findByChatRoomId(Long chatRoomId, Pageable pageable);
    List<ChatMessage> findByChatRoomIdOrderBySentAtAsc(Long chatRoomId);
    
    long countByChatRoomAndSenderAndStatusNot(
            ChatRoom room,
            String sender,
            MessageStatus status
    );
    
    Page<ChatMessage> findByChatRoom(ChatRoom room, Pageable pageable);
}

