package com.ecommerce.app.requestDto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CameraCategoryRequestDTO {
    @NotBlank(message = "Category name is required")
    private String name;
}
