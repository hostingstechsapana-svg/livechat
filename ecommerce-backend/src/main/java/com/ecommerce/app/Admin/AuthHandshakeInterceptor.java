package com.ecommerce.app.Admin;

import java.util.Map;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import com.ecommerce.app.repository.UserRepository;
import com.ecommerce.app.security.JwtUtil;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AuthHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtUtil jwtUtil; // timro JWT util
    private final UserRepository userRepository;

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes) {

        if (request instanceof ServletServerHttpRequest servletRequest) {

            String token = servletRequest
                    .getServletRequest()
                    .getParameter("token"); // front-end le WebSocket connect garda token pathaune

            if (token != null && !token.isBlank()) {

                attributes.put("token", token);

                // ✅ Extract userId from JWT
                try {
                    Long userId = jwtUtil.extractUserId(token);
                    attributes.put("userId", userId);
                } catch (Exception e) {
                    // invalid token → treat as guest
                }
            }
        }
        return true;
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception) {
        // nothing needed
    }
}

