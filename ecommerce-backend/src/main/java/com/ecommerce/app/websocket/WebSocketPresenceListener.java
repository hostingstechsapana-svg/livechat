package com.ecommerce.app.websocket;

import java.time.LocalDateTime;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.ecommerce.app.entities.User;
import com.ecommerce.app.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class WebSocketPresenceListener {

    private final UserRepository userRepository;

    @EventListener
    public void handleConnect(SessionConnectEvent event) {

        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(
                event.getMessage()
        );

        Object userId = accessor.getSessionAttributes().get("userId");

        if (userId == null) return; // guest user

        userRepository.findById(Long.valueOf(userId.toString()))
            .ifPresent(user -> {
                user.setOnline(true);
                userRepository.save(user);
            });
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {

        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(
                event.getMessage()
        );

        Object userId = accessor.getSessionAttributes().get("userId");

        if (userId == null) return; // guest user

        userRepository.findById(Long.valueOf(userId.toString()))
            .ifPresent(user -> {
                user.setOnline(false);
                user.setLastSeen(LocalDateTime.now());
                userRepository.save(user);
            });
    }
}
