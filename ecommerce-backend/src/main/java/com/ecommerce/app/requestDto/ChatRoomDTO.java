package com.ecommerce.app.requestDto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatRoomDTO {
    private Long id;
    private String sessionId;
    private LocalDateTime createdAt;
}
