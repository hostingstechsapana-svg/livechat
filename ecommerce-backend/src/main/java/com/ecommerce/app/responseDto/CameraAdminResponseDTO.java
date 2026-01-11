package com.ecommerce.app.responseDto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.ecommerce.app.ENUM.CameraCondition;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class CameraAdminResponseDTO {

    private Long id;
    private String cameraName;
    private String serialNumber;
    private String description;

    private BigDecimal price;
    private Integer discountPercentage;
    private BigDecimal discountAmount;
    private BigDecimal discountedPrice;

    private String categoryName;
    private String subCategoryName;   
    private Long shutterCount;      
    private CameraCondition cameraCondition;
    private boolean deleted;
    private LocalDateTime createdAt;

    private List<String> images;
}

