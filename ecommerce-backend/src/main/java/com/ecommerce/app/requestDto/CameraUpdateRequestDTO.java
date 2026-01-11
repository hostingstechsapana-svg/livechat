package com.ecommerce.app.requestDto;

import java.math.BigDecimal;
import java.util.List;

import com.ecommerce.app.ENUM.CameraCondition;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CameraUpdateRequestDTO {

    private String cameraName;
    private String serialNumber;
    private BigDecimal price;
    private Integer discountPercentage;
    private String description;

    private Long categoryId;

   
    private Long subCategoryId;

    private Long shutterCount;
    private CameraCondition cameraCondition; // ✅ ALLOW UPDATE

    private List<String> imageUrls;
}
