package com.ecommerce.app.controller;

import java.io.IOException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.app.payload.ApiResponse;
import com.ecommerce.app.requestDto.LoginRequestDto;
import com.ecommerce.app.responseDto.LoginResponseDto;
import com.ecommerce.app.serviceImpl.AuthService;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDto>> login(@RequestBody LoginRequestDto request) {
    	LoginResponseDto response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.<LoginResponseDto>builder()
                .success(true)
                .message("Login successful")
                .data(response)
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        authService.logout(token);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Logout successful")
                .build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<String>> refreshToken(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String newToken = authService.refreshToken(token);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Token refreshed successfully")
                .data(newToken)
                .build());
    }

        @GetMapping("/google")
        public void redirectToGoogle(HttpServletResponse response) throws IOException {
            response.sendRedirect("/oauth2/authorization/google");
        }
    }

