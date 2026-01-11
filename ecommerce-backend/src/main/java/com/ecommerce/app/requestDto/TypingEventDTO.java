package com.ecommerce.app.requestDto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TypingEventDTO {
    private String sessionId;
    private String sender; // USER / ADMIN
    private boolean typing;
}
