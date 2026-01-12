package com.ecommerce.app.responseDto;


import java.time.LocalDateTime;

public record ChatRoomResponse(
    Long id,
    String sessionId,
    boolean closed,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,

    // User info (flattened)
    Long userId,
    String userFullName,
    String userEmail,
    String userRole,
    boolean userOnline
) {}
