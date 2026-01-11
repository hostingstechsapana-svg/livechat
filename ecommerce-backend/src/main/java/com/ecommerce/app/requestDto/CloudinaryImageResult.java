package com.ecommerce.app.requestDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter @AllArgsConstructor
@Builder
public class CloudinaryImageResult {
    private String imageUrl;
    private String publicId;
}
