package com.ecommerce.app.responseDto;

import java.math.BigDecimal;
import java.util.List;

import com.ecommerce.app.ENUM.CameraCondition;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Builder
public class CameraResponseDTO {

    private Long id;
    private String cameraName;
    private String description;
    private BigDecimal price;
    private Integer discountPercentage;   // optional
    private BigDecimal discountAmount;    // calculated discount
    private BigDecimal discountedPrice;
    private String categoryName;
    
    private String subCategoryName; 
    private Long shutterCount;
    
    private CameraCondition cameraCondition;
    private List<String> images;
}
