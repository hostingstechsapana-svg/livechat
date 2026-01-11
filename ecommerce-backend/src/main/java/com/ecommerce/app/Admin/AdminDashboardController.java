package com.ecommerce.app.Admin;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.app.payload.ApiResponse;
import com.ecommerce.app.responseDto.AdminDashboardCountResponseDTO;
import com.ecommerce.app.responseDto.CategoryCameraChartResponseDTO;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    @GetMapping("/counts")
    public ResponseEntity<ApiResponse<AdminDashboardCountResponseDTO>> getCounts() {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Dashboard statistics fetched successfully",
                        dashboardService.getDashboardCounts()
                )
        );
    }
    
    @GetMapping("/category-camera-chart")
    public ResponseEntity<ApiResponse<List<CategoryCameraChartResponseDTO>>> 
            getCategoryCameraChart() {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Category wise camera distribution fetched",
                        dashboardService.getCategoryCameraDistribution()
                )
        );
    }

}
