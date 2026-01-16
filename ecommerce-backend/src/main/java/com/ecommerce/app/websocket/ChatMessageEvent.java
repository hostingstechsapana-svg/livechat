package com.ecommerce.app.websocket;

import java.time.LocalDateTime;

import com.ecommerce.app.ENUM.MessageStatus;
import com.ecommerce.app.entities.ChatMessage;
import com.ecommerce.app.entities.ChatRoom;

public record ChatMessageEvent(
        Long id,
        String sessionId,
        String sender,
        String text,
        MessageStatus status,
        LocalDateTime timestamp
) {

    // ✅ Factory method to convert ChatMessage → ChatMessageEvent
    public static ChatMessageEvent from(ChatMessage msg) {

        ChatRoom room = msg.getChatRoom();

        String sessionKey;

        if (room.getSessionId() != null) {
            // PUBLIC chat
            sessionKey = room.getSessionId();
        } else if (room.getUser() != null) {
            // LOGGED-IN user chat
            sessionKey = "user-" + room.getUser().getId();
        } else {
            // Fallback (should never happen)
            sessionKey = "unknown";
        }

        return new ChatMessageEvent(
                msg.getId(),
                sessionKey,
                msg.getSender(),
                msg.getMessage(),
                msg.getStatus(),
                msg.getSentAt()
        );
    }
}
