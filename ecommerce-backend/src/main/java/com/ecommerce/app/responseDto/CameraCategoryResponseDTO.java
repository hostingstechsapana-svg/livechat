package com.ecommerce.app.responseDto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CameraCategoryResponseDTO {
    private Long id;
    private String name;
}
