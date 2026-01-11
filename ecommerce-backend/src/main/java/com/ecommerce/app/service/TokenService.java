package com.ecommerce.app.service;



import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class TokenService {

    private final ConcurrentHashMap<String, Boolean> tokenBlacklist = new ConcurrentHashMap<>();

    public void invalidateToken(String token) {
        tokenBlacklist.put(token, true);
    }

    public boolean isTokenValid(String token) {
        return !tokenBlacklist.containsKey(token);
    }
}

