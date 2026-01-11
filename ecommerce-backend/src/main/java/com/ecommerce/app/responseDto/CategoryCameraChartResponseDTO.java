package com.ecommerce.app.responseDto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryCameraChartResponseDTO {

    private String categoryName;
    private long cameraCount;
}
