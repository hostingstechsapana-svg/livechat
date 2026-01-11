package com.ecommerce.app.Admin;

import java.util.Map;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import com.ecommerce.app.security.JwtUtil;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = 
            MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) return message;

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            Map<String, Object> sessionAttributes = accessor.getSessionAttributes();

            // Allow anonymous connections for chat
            if (sessionAttributes == null || !sessionAttributes.containsKey("token")) {
                // Anonymous connection allowed
                return message;
            }

            String token = sessionAttributes.get("token").toString();

            if (!jwtUtil.validateToken(token)) {
                throw new AccessDeniedException("Invalid JWT token");
            }

            // Attach user info for authenticated connections
//            accessor.setUser(jwtUtil.getAuthentication(token));
        }

        return message;
    }
}

