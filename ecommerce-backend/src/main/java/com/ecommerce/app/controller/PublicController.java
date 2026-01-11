package com.ecommerce.app.controller;

import java.awt.print.Pageable;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.app.ENUM.CameraCondition;
import com.ecommerce.app.payload.ApiResponse;
import com.ecommerce.app.requestDto.ChatRoomDTO;
import com.ecommerce.app.responseDto.CameraAdminResponseDTO;
import com.ecommerce.app.responseDto.CameraCategoryResponseDTO;
import com.ecommerce.app.responseDto.CameraResponseDTO;
import com.ecommerce.app.responseDto.SubCategoryResponseDTO;
import com.ecommerce.app.service.CameraCategoryService;
import com.ecommerce.app.service.CameraService;
import com.ecommerce.app.service.CameraSubCategoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

	private final CameraService cameraService;
	private final CameraCategoryService categoryService;
    private final CameraSubCategoryService subCategoryService;

    
	@GetMapping("/camera")
    public ResponseEntity<ApiResponse<List<CameraResponseDTO>>> getAll() {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Camera list fetched", cameraService.getAllCameras())
        );
    }
	
	 @GetMapping("/category")
	    public ResponseEntity<ApiResponse<List<CameraCategoryResponseDTO>>> getAllCategories() {
	        return ResponseEntity.ok(
	                new ApiResponse<>(true, "Category list fetched", categoryService.getAllCategories())
	        );
	    }
	 
	 @GetMapping("/subcategory")
	    public ResponseEntity<List<SubCategoryResponseDTO>> getAllSubCategories() {
	        return ResponseEntity.ok(
	                subCategoryService.getAllSubCategories()
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
	  
	    //  GET BY CATEGORY
	    @GetMapping("/category/{categoryId}")
	    public ResponseEntity<List<SubCategoryResponseDTO>> getByCategory(
	            @PathVariable Long categoryId
	    ) {
	        return ResponseEntity.ok(subCategoryService.getByCategory(categoryId));
	    }
	    
	    @GetMapping("/cameras/filter/{condition}")
	    public ResponseEntity<ApiResponse<List<CameraResponseDTO>>> filterByCondition(
	            @PathVariable CameraCondition condition) {

	        return ResponseEntity.ok(
	                new ApiResponse<>(true, "Filtered cameras fetched",
	                        cameraService.getCamerasByCondition(condition))
	        );
	    }


}
