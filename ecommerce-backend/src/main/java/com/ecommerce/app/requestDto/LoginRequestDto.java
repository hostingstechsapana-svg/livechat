package com.ecommerce.app.requestDto;

import lombok.Data;

@Data
public class LoginRequestDto {
    private String email;
    private String password;
}