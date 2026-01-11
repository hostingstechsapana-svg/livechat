package com.ecommerce.app.Admin;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ecommerce.app.repository.CameraCategoryRepository;
import com.ecommerce.app.repository.CameraRepository;
import com.ecommerce.app.responseDto.AdminDashboardCountResponseDTO;
import com.ecommerce.app.responseDto.CategoryCameraChartResponseDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final CameraRepository cameraRepository;
    private final CameraCategoryRepository categoryRepository;

    @Override
    public AdminDashboardCountResponseDTO getDashboardCounts() {

        //  First & Last day of current month
        LocalDateTime monthStart = LocalDate.now()
                .withDayOfMonth(1)
                .atStartOfDay();

        LocalDateTime monthEnd = LocalDate.now()
                .withDayOfMonth(LocalDate.now().lengthOfMonth())
                .atTime(LocalTime.MAX);

        return AdminDashboardCountResponseDTO.builder()

                // Overall counts
                .totalCategories(categoryRepository.count())
                .totalCameras(cameraRepository.count())
                .activeCameras(cameraRepository.countByDeletedFalse())

                // Monthly counts
                .categoriesCreatedThisMonth(
                        categoryRepository.countByCreatedAtBetween(
                                monthStart, monthEnd
                        )
                )
                .camerasUploadedThisMonth(
                        cameraRepository.countByCreatedAtBetween(
                                monthStart, monthEnd
                        )
                )
                .activeCamerasThisMonth(
                        cameraRepository.countByDeletedFalseAndCreatedAtBetween(
                                monthStart, monthEnd
                        )
                )
                .build();
    }
    
    @Override
    public List<CategoryCameraChartResponseDTO> getCategoryCameraDistribution() {

        return cameraRepository.countCamerasByCategory()
                .stream()
                .map(p -> CategoryCameraChartResponseDTO.builder()
                        .categoryName(p.getCategoryName())
                        .cameraCount(p.getCameraCount())
                        .build()
                )
                .toList();
    }

}
