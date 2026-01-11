package com.ecommerce.app.service;

import java.time.LocalDateTime;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import com.ecommerce.app.ENUM.MessageStatus;
import com.ecommerce.app.entities.ChatMessage;
import com.ecommerce.app.entities.ChatRoom;
import com.ecommerce.app.repository.ChatMessageRepository;
import com.ecommerce.app.repository.ChatRoomRepository;
import com.ecommerce.app.requestDto.ChatMessageDTO;
import com.ecommerce.app.requestDto.ChatRoomDTO;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final EmailService emailService;

    public ChatMessage saveMessage(ChatMessageDTO dto) {

    	ChatRoom room = chatRoomRepository
                .findBySessionId(dto.getSessionId())
                .orElseGet(() -> chatRoomRepository.save(
                        ChatRoom.builder()
                        .sessionId(dto.getSessionId())
                                .closed(false)
                                .build()
                ));

        //  update last activity
        room.setUpdatedAt(LocalDateTime.now());
        chatRoomRepository.save(room);

        ChatMessage message = ChatMessage.builder()
                .chatRoom(room)
                .message(dto.getMessage())
                .sender(dto.getSender())
                .status(MessageStatus.SENT)
                .sentAt(LocalDateTime.now())
                .build();
        ChatMessage saved = chatMessageRepository.save(message);

        handleAdminEmailNotification(saved);

        return saved;
    }

    public long countUnread(ChatRoom room) {
        return chatMessageRepository
                .countByChatRoomAndSenderAndStatusNot(
                        room,
                        "USER",
                        MessageStatus.SEEN
                );
    }

    public void markSeen(Long messageId) {
        ChatMessage msg = chatMessageRepository.findById(messageId)
                .orElseThrow();
        msg.setStatus(MessageStatus.SEEN);
    }
    
    public Page<ChatRoomDTO> getAllActiveChats(Pageable pageable) {
        return chatRoomRepository.findByClosedFalse(pageable)
            .map(room -> new ChatRoomDTO(
                room.getId(),
                room.getSessionId(),
                room.getCreatedAt()
            ));
    }
    
    private void handleAdminEmailNotification(ChatMessage message) {

        // 1️ only admin messages
        if (!"ADMIN".equals(message.getSender())) return;

        ChatRoom room = message.getChatRoom();

        // 2️ guest?> no email
        if (room.getUser() == null) return;

        // 3️ user offline? > send email
        if (!room.getUser().isOnline()) {
            emailService.sendNewMessageNotification(
                room.getUser().getEmail()
            );
        }
    }
}
