package com.ecommerce.app.websocket;

import java.time.LocalDateTime;

import com.ecommerce.app.ENUM.MessageStatus;

public record ChatMessageEvent(
        Long id,
        String sessionId,
        String sender,
        String text,
        MessageStatus status,
        LocalDateTime timestamp
) {}
