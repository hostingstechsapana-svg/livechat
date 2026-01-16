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
import com.ecommerce.app.repository.UserRepository;
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
    private final UserRepository userRepo;
    
    public ChatMessage saveMessage(ChatMessageDTO dto, Long userId) {

        ChatRoom room = chatRoomRepository
            .findBySessionId(dto.getSessionId())
            .orElseGet(() -> chatRoomRepository.save(
                ChatRoom.builder()
                    .sessionId(dto.getSessionId())
                    .closed(false)
                    .build()
            ));

        // ✅ Attach logged-in user ONCE
        if (userId != null && room.getUser() == null) {
        	userRepo.findById(userId)
                .ifPresent(room::setUser);
        }

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

        handleEmailNotification(saved);

        return saved;
    }
    
    public ChatMessage savePublicMessage(ChatMessageDTO dto) {

        ChatRoom room = chatRoomRepository
            .findBySessionId(dto.getSessionId())
            .orElseGet(() -> chatRoomRepository.save(
                ChatRoom.builder()
                    .sessionId(dto.getSessionId())
                    .closed(false)
                    .build()
            ));

        ChatMessage msg = ChatMessage.builder()
            .chatRoom(room)
            .sender("PUBLIC")
            .message(dto.getMessage())
            .status(MessageStatus.SENT)
            .sentAt(LocalDateTime.now())
            .build();

        return chatMessageRepository.save(msg);
    }

    public ChatMessage saveUserMessage(String message, Long userId) {

        ChatRoom room = chatRoomRepository
            .findByUserId(userId)
            .orElseGet(() -> chatRoomRepository.save(
                ChatRoom.builder()
                    .user(userRepo.findById(userId).orElseThrow())
                    .closed(false)
                    .build()
            ));

        ChatMessage msg = ChatMessage.builder()
            .chatRoom(room)
            .sender("USER")
            .message(message)
            .status(MessageStatus.SENT)
            .sentAt(LocalDateTime.now())
            .build();
        
        ChatMessage saved = chatMessageRepository.save(msg);
        handleEmailNotification(saved);
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
    
    private void handleEmailNotification(ChatMessage message) {

        ChatRoom room = message.getChatRoom();

        // =========================
        // USER / PUBLIC → ADMIN
        // =========================
        if (!"ADMIN".equals(message.getSender())) {

            // If admin offline → email admin
          
            return;
        }

        // =========================
        // ADMIN → USER
        // =========================
        if (room.getUser() != null) {

            if (!room.getUser().isOnline()) {
                emailService.sendNewMessageNotification(
                    room.getUser().getEmail()
                );
            }
        }
    }

}
