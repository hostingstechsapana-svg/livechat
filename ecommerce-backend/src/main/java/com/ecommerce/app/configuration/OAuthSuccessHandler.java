package com.ecommerce.app.configuration;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.ecommerce.app.ENUM.Role;
import com.ecommerce.app.entities.User;
import com.ecommerce.app.repository.UserRepository;
import com.ecommerce.app.security.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuthSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtService;
//    private final BCryptPasswordEncoder passwordEncoder; // hashed password

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        OAuth2User oAuthUser = (OAuth2User) authentication.getPrincipal();

        String email = oAuthUser.getAttribute("email");
        String name  = oAuthUser.getAttribute("name");

        // ✅ Save user if not exists
        User user = userRepository.findByEmail(email)
            .orElseGet(() -> {
                // hash a placeholder password for OAuth users
//                String hashedPassword = passwordEncoder.encode("oauth_user_placeholder");

                return userRepository.save(
                    User.builder()
                        .email(email)
                        .fullName(name)
                        .role(Role.USER)
//                        .password(hashedPassword)
                        .build()
                );
            });

        // ✅ Generate JWT
        String token = jwtService.generateToken(user.getId(), user.getRole());

        // ✅ Redirect to frontend with token
        response.sendRedirect(
            "http://localhost:3000/oauth-success"
            + "?token=" + token
            + "&role=" + user.getRole().name()
        );
    }
}
