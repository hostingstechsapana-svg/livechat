package com.ecommerce.app.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ecommerce.app.ENUM.CameraCondition;
import com.ecommerce.app.payload.ApiResponse;
import com.ecommerce.app.requestDto.CameraCreateRequestDTO;
import com.ecommerce.app.requestDto.CameraUpdateRequestDTO;
import com.ecommerce.app.responseDto.CameraAdminResponseDTO;
import com.ecommerce.app.service.CameraService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/cameras")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class CameraAdminController {

    private final CameraService cameraService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CameraAdminResponseDTO>> createCamera(
            @ModelAttribute @Valid CameraCreateRequestDTO dto,
            @RequestPart("images") List<MultipartFile> images
    ) {
        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Camera created successfully",
                        cameraService.createCamera(dto, images)
                )
        );
    }


    @GetMapping
    public ResponseEntity<ApiResponse<List<CameraAdminResponseDTO>>> getAll() {
        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Camera list fetched",
                        cameraService.getAllCamerasForAdmin()
                )
        );
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CameraAdminResponseDTO>> getCameraById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Camera fetched",
                        cameraService.getCameraByIdForAdmin(id)
                )
        );
    }

    
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CameraAdminResponseDTO>> updateCamera(
            @PathVariable Long id,
            @RequestPart("data") CameraUpdateRequestDTO dto,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Camera updated successfully",
                        cameraService.updateCamera(id, dto, images)
                )
        );
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        cameraService.deleteCamera(id);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Camera deleted", null)
        );
    }
    
    @GetMapping("/filter/condition/{condition}")
    public ResponseEntity<ApiResponse<List<CameraAdminResponseDTO>>> filterByCondition(
            @PathVariable CameraCondition condition) {

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Admin filtered cameras fetched",
                        cameraService.getCamerasByConditionForAdmin(condition))
        );
    }
}
