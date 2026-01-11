package com.ecommerce.app.responseDto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SubCategoryResponseDTO {
    private Long id;
    private String name;
    private String categoryName;
}

