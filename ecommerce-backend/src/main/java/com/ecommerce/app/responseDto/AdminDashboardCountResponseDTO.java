package com.ecommerce.app.responseDto;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDashboardCountResponseDTO {

    // Overall
    private long totalCategories;
    private long totalCameras;
    private long activeCameras;

    // This Month
    private long categoriesCreatedThisMonth;
    private long camerasUploadedThisMonth;
    private long activeCamerasThisMonth;
}

