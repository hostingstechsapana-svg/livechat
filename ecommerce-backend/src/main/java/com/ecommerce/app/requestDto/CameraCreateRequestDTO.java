package com.ecommerce.app.requestDto;

import java.math.BigDecimal;
import java.util.List;

import com.ecommerce.app.ENUM.CameraCondition;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CameraCreateRequestDTO {

    private String cameraName;
    private String serialNumber;
    private BigDecimal price;
    private Integer discountPercentage;
    private String description;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "SubCategory ID is required")
    private Long subCategoryId;

    private Long shutterCount;
    private CameraCondition cameraCondition;
    
    private List<String> imageUrls;
}

