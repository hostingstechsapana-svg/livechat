package com.ecommerce.app.responseDto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SubCategoryFilterResponseDTO {
    private Long id;
    private String name;
    private String categoryName;
    private long cameraCount;
}
