package com.ecommerce.app.responseDto;

import lombok.Data;

@Data
public class LoginResponseDto {
    private String token;
    private String role;
}