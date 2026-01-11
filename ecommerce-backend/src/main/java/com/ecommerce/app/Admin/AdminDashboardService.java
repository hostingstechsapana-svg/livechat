package com.ecommerce.app.Admin;


import java.util.List;

import com.ecommerce.app.responseDto.AdminDashboardCountResponseDTO;
import com.ecommerce.app.responseDto.CategoryCameraChartResponseDTO;

public interface AdminDashboardService {

    AdminDashboardCountResponseDTO getDashboardCounts();
    List<CategoryCameraChartResponseDTO> getCategoryCameraDistribution();
}
