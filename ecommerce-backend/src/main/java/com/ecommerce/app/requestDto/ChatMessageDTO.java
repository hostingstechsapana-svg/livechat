package com.ecommerce.app.requestDto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ChatMessageDTO {
    private String sessionId;
    private String sender; // "USER" or "ADMIN"
    private String message;
}
