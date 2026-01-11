package com.ecommerce.app.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.ecommerce.app.ENUM.CameraCondition;
import com.ecommerce.app.requestDto.CameraCreateRequestDTO;
import com.ecommerce.app.requestDto.CameraUpdateRequestDTO;
import com.ecommerce.app.responseDto.CameraAdminResponseDTO;
import com.ecommerce.app.responseDto.CameraResponseDTO;

public interface CameraService {

    // ================= PUBLIC (USER) =================
    List<CameraResponseDTO> getAllCameras();

    CameraResponseDTO getCameraById(Long cameraId);

    // ================= ADMIN =================
    CameraAdminResponseDTO createCamera(
            CameraCreateRequestDTO dto,
            List<MultipartFile> images
    );

    CameraAdminResponseDTO updateCamera(
            Long cameraId,
            CameraUpdateRequestDTO dto,
            List<MultipartFile> images
    );

    List<CameraAdminResponseDTO> getAllCamerasForAdmin();

    CameraAdminResponseDTO getCameraByIdForAdmin(Long cameraId);

    void deleteCamera(Long cameraId);
    
    List<CameraResponseDTO> getCamerasByCondition(CameraCondition condition);
    
 // ADMIN FILTER
    List<CameraAdminResponseDTO> getCamerasByConditionForAdmin(CameraCondition condition);

}
