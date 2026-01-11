package com.ecommerce.app.websocket;

public record AdminChatEvent(
        String type,          // NEW_CHAT, NEW_MESSAGE, UNREAD_UPDATE
        String sessionId,
        Object payload
) {}

