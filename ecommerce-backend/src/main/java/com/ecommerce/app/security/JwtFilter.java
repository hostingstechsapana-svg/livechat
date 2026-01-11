package com.ecommerce.app.security;

import java.io.IOException;
import java.util.Collections;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.ecommerce.app.service.TokenService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;

@Component
@AllArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final TokenService tokenService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            		throws ServletException, IOException {

        String uri = request.getRequestURI();

        // ✅ Skip WebSocket & public endpoints
        if (uri.startsWith("/login")
                || uri.startsWith("/oauth2")
                || uri.startsWith("/ws")
                || uri.startsWith("/app")
                || uri.startsWith("/topic")
                || uri.startsWith("/chat")){

            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            if (!tokenService.isTokenValid(token) || !jwtUtil.validateToken(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }

            Long userId = jwtUtil.extractUserId(token);
            String role = jwtUtil.extractRole(token).toUpperCase();
            String grantedRole = role.startsWith("ROLE_") ? role : "ROLE_" + role;

            User principal = new User(
                String.valueOf(userId),
                "",
                Collections.singletonList(new SimpleGrantedAuthority(grantedRole))
            );

            UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                    principal,
                    null,
                    principal.getAuthorities()
                );

            authentication.setDetails(
                new WebAuthenticationDetailsSource().buildDetails(request)
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();

        return uri.startsWith("/ws")
            || uri.startsWith("/app")
            || uri.startsWith("/topic")
//            || uri.startsWith("/chat")
            || uri.startsWith("/api/v1/auth")
            || uri.startsWith("/api/public")
            || uri.startsWith("/login/oauth2")
            || uri.startsWith("/chats/session")
            || uri.startsWith("/oauth2");
    }

}

