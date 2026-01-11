//package com.ecommerce.app.controller;
//
//import java.util.Optional;
//
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.messaging.handler.annotation.MessageMapping;
//import org.springframework.messaging.simp.SimpMessagingTemplate;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import com.ecommerce.app.entities.ChatMessage;
//import com.ecommerce.app.entities.ChatRoom;
//import com.ecommerce.app.repository.ChatMessageRepository;
//import com.ecommerce.app.repository.ChatRoomRepository;
//import com.ecommerce.app.requestDto.ChatMessageDTO;
//import com.ecommerce.app.requestDto.TypingEventDTO;
//import com.ecommerce.app.service.ChatService;
//import com.ecommerce.app.websocket.AdminChatEvent;
//import com.ecommerce.app.websocket.ChatMessageEvent;
//import com.ecommerce.app.websocket.UnreadCountPayload;
//
//import lombok.RequiredArgsConstructor;
//
//@RestController
//@RequiredArgsConstructor
//public class ChatController {
//
//    private final SimpMessagingTemplate messagingTemplate;
//    private final ChatService chatService;
//    private final ChatRoomRepository chatRoomRepository;
//    private final ChatMessageRepository chatMessageRepository;
//
//    // ===============================
//    // SEND MESSAGE
//    // ===============================
//    @MessageMapping("/chat.send")
//    public void sendMessage(ChatMessageDTO dto) {
//
//        ChatMessage saved = chatService.saveMessage(dto);
//        ChatRoom room = saved.getChatRoom();
//
//        // 1️⃣ Send message to USER + ADMIN (session topic)
//        ChatMessageEvent messageEvent = new ChatMessageEvent(
//                saved.getId(),
//                room.getSessionId(),
//                saved.getSender(),
//                saved.getMessage(),
//                saved.getStatus(),
//                saved.getSentAt()
//        );
//
//        messagingTemplate.convertAndSend(
//                "/topic/chat/" + room.getSessionId(),
//                messageEvent
//        );
//
//        // 2️⃣ Notify ADMIN globally
//        AdminChatEvent adminMessageEvent = new AdminChatEvent(
//                "NEW_MESSAGE",
//                room.getSessionId(),
//                messageEvent
//        );
//
//        messagingTemplate.convertAndSend(
//                "/topic/admin/chats",
//                adminMessageEvent
//        );
//
//        //  Update unread count (only when USER sends)
//        if ("USER".equals(saved.getSender())) {
//            long unread = chatService.countUnread(room);
//
//            messagingTemplate.convertAndSend(
//                    "/topic/admin/chats",
//                    new AdminChatEvent(
//                            "UNREAD_UPDATE",
//                            room.getSessionId(),
//                            new UnreadCountPayload(unread)
//                    )
//            );
//        }
//    }
//
//    // ===============================
//    // TYPING
//    // ===============================
//    @MessageMapping("/chat.typing")
//    public void typing(TypingEventDTO dto) {
//        messagingTemplate.convertAndSend(
//                "/topic/typing/" + dto.getSessionId(),
//                dto
//        );
//    }
//
//    // ===============================
//    // MARK SEEN
//    // ===============================
//    @PostMapping("/chat/{id}/seen")
//    @PreAuthorize("permitAll()")
//    public void markSeen(@PathVariable Long id) {
//        chatService.markSeen(id);
//    }
//
//    // ===============================
//    // CHAT HISTORY (SESSION BASED)
//    // ===============================
//    @GetMapping("/api/admin/chats/session/{sessionId}/messages")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<Page<ChatMessageEvent>> getMessages(
//            @PathVariable String sessionId,
//            Pageable pageable
//    ) {
//        Optional<ChatRoom> optionalRoom =
//                chatRoomRepository.findBySessionId(sessionId);
//
//        if (optionalRoom.isEmpty()) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Page.empty());
//        }
//
//        ChatRoom room = optionalRoom.get();
//
//        Page<ChatMessageEvent> page = chatMessageRepository
//                .findByChatRoom(room, pageable)
//                .map(msg -> new ChatMessageEvent(
//                        msg.getId(),
//                        sessionId,
//                        msg.getSender(),
//                        msg.getMessage(),
//                        msg.getStatus(),
//                        msg.getSentAt()
//                ));
//
//        return ResponseEntity.ok(page);
//    }
//
//    
//    @GetMapping("/api/admin/chats")
//    @PreAuthorize("hasRole('ADMIN')")
//    public Page<ChatRoom> getChatRooms(Pageable pageable) {
//        return chatRoomRepository.findAll(pageable);
//    }
//
//}
//
package com.ecommerce.app.controller;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.messaging.Message;


import com.ecommerce.app.entities.ChatMessage;
import com.ecommerce.app.entities.ChatRoom;
import com.ecommerce.app.repository.ChatMessageRepository;
import com.ecommerce.app.repository.ChatRoomRepository;
import com.ecommerce.app.requestDto.ChatMessageDTO;
import com.ecommerce.app.requestDto.TypingEventDTO;
import com.ecommerce.app.service.ChatService;
import com.ecommerce.app.websocket.ChatMessageEvent;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;

    // ===============================
    // SEND MESSAGE
    // ===============================
    @MessageMapping("/chat.send")
    public void sendMessage(
            ChatMessageDTO dto,
            Message<?> message
    ) {
        StompHeaderAccessor accessor =
            StompHeaderAccessor.wrap(message);

        Long userId = null;

        if (accessor.getSessionAttributes() != null) {
            Object uid = accessor.getSessionAttributes().get("userId");
            if (uid != null) {
                userId = Long.valueOf(uid.toString());
            }
        }

        ChatMessage saved = chatService.saveMessage(dto, userId);

        ChatRoom room = saved.getChatRoom();

        ChatMessageEvent event = new ChatMessageEvent(
            saved.getId(),
            room.getSessionId(),
            saved.getSender(),
            saved.getMessage(),
            saved.getStatus(),
            saved.getSentAt()
        );

        messagingTemplate.convertAndSend(
            "/topic/chat/" + room.getSessionId(),
            event
        );
    }


    // ===============================
    // TYPING
    // ===============================
    @MessageMapping("/chat.typing")
    public void typing(TypingEventDTO dto) {
        messagingTemplate.convertAndSend(
                "/topic/typing/" + dto.getSessionId(),
                dto
        );
    }

    // ===============================
    // MARK SEEN
    // ===============================
    @PostMapping("/chat/{id}/seen")
    @PreAuthorize("permitAll()")
    public void markSeen(@PathVariable Long id) {
        chatService.markSeen(id);
    }

    // ===============================
    // CHAT HISTORY (USER ENDPOINT - ADDED)
    // ===============================
    @GetMapping("/chats/session/{sessionId}/messages")
    public ResponseEntity<Page<ChatMessageEvent>> getUserMessages(
            @PathVariable String sessionId,
            Pageable pageable
    ) {
        Optional<ChatRoom> optionalRoom =
                chatRoomRepository.findBySessionId(sessionId);

        if (optionalRoom.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Page.empty());
        }

        ChatRoom room = optionalRoom.get();

        Page<ChatMessageEvent> page = chatMessageRepository
                .findByChatRoom(room, pageable)
                .map(msg -> new ChatMessageEvent(
                        msg.getId(),
                        sessionId,
                        msg.getSender(),
                        msg.getMessage(),
                        msg.getStatus(),
                        msg.getSentAt()
                ));

        return ResponseEntity.ok(page);
    }

    // ===============================
    // CHAT HISTORY (ADMIN ENDPOINT)
    // ===============================
    @GetMapping("/api/admin/chats/session/{sessionId}/messages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ChatMessageEvent>> getMessages(
            @PathVariable String sessionId,
            Pageable pageable
    ) {
        Optional<ChatRoom> optionalRoom =
                chatRoomRepository.findBySessionId(sessionId);

        if (optionalRoom.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Page.empty());
        }

        ChatRoom room = optionalRoom.get();

        Page<ChatMessageEvent> page = chatMessageRepository
                .findByChatRoom(room, pageable)
                .map(msg -> new ChatMessageEvent(
                        msg.getId(),
                        sessionId,
                        msg.getSender(),
                        msg.getMessage(),
                        msg.getStatus(),
                        msg.getSentAt()
                ));

        return ResponseEntity.ok(page);
    }


    @GetMapping("/api/admin/chats")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<ChatRoom> getChatRooms(Pageable pageable) {
        return chatRoomRepository.findAll(pageable);
    }
    
    @GetMapping("/chats/me/messages")
    public ResponseEntity<Page<ChatMessageEvent>> getMyMessages(
            Authentication auth,
            Pageable pageable
    ) {
        Long userId = Long.parseLong(auth.getName());

        ChatRoom room = chatRoomRepository
            .findByUserId(userId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Chat room not found"
            ));

        Page<ChatMessageEvent> page =
            chatMessageRepository.findByChatRoom(room, pageable)
                .map(msg -> new ChatMessageEvent(
                    msg.getId(),
                    room.getSessionId(),
                    msg.getSender(),
                    msg.getMessage(),
                    msg.getStatus(),
                    msg.getSentAt()
                ));

        return ResponseEntity.ok(page);
    }
}

