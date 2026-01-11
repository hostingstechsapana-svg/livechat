package com.ecommerce.app.serviceImpl;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ecommerce.app.ENUM.Role;
import com.ecommerce.app.entities.User;
import com.ecommerce.app.exceptionHandling.InvalidCredentialsException;
import com.ecommerce.app.repository.UserRepository;
import com.ecommerce.app.requestDto.LoginRequestDto;
import com.ecommerce.app.responseDto.LoginResponseDto;
import com.ecommerce.app.security.JwtUtil;
import com.ecommerce.app.service.TokenService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final TokenService tokenService;

    public LoginResponseDto login(LoginRequestDto request) {
        User admin = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid Credentials"));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new InvalidCredentialsException("Invalid Credentials");
        }

        String token = jwtUtil.generateToken(admin.getId(), Role.ADMIN);

        LoginResponseDto response = new LoginResponseDto();
        response.setToken(token);
        response.setRole(admin.getRole().name());

        return response;
    }

    public void logout(String token) {
        tokenService.invalidateToken(token);
    }

    public boolean isTokenValid(String token) {
        return tokenService.isTokenValid(token) && jwtUtil.validateToken(token);
    }

    public String refreshToken(String token) {
        if (!jwtUtil.isTokenExpired(token)) {
            throw new RuntimeException("Token is still valid. Refresh not needed.");
        }

        Long adminId = jwtUtil.extractUserId(token);
        Optional<User> adminOpt = userRepository.findById(adminId);
        if (adminOpt.isEmpty()) throw new RuntimeException("Admin not found");

        return jwtUtil.generateToken(adminId, Role.ADMIN);
    }
}

