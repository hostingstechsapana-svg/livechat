package com.ecommerce.app.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.app.payload.ApiResponse;
import com.ecommerce.app.requestDto.SubCategoryCreateRequestDTO;
import com.ecommerce.app.responseDto.SubCategoryFilterResponseDTO;
import com.ecommerce.app.responseDto.SubCategoryResponseDTO;
import com.ecommerce.app.service.CameraSubCategoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/v1/camera-subcategories")
@RequiredArgsConstructor
public class CameraSubCategoryController {

    private final CameraSubCategoryService subCategoryService;

    // ✅ CREATE
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<SubCategoryResponseDTO>> createSubCategory(
            @RequestBody SubCategoryCreateRequestDTO dto) {
        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Subcategory created successfully",
                        subCategoryService.create(dto)
                )
        );
    }

    //  GET ALL
    @GetMapping
    public ResponseEntity<List<SubCategoryResponseDTO>> getAllSubCategories() {
        return ResponseEntity.ok(subCategoryService.getAllSubCategories());
    }

    //  GET BY CATEGORY
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<SubCategoryResponseDTO>> getByCategory(
            @PathVariable Long categoryId
    ) {
        return ResponseEntity.ok(subCategoryService.getByCategory(categoryId));
    }

    //  GET FOR FILTER (with camera count)
    @GetMapping("/filter/{categoryId}")
    public ResponseEntity<List<SubCategoryFilterResponseDTO>> getForFilter(
            @PathVariable Long categoryId
    ) {
        return ResponseEntity.ok(subCategoryService.getSubCategoriesForFilter(categoryId));
    }
    
 // ✅ UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SubCategoryResponseDTO>> updateSubCategory(
            @PathVariable Long id,
            @RequestBody SubCategoryCreateRequestDTO dto
    ) {
        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Subcategory updated successfully",
                        subCategoryService.update(id, dto)
                )
        );
    }

    // ✅ COUNT
    @GetMapping("/count")
    public ResponseEntity<Long> getSubCategoryCount() {
        return ResponseEntity.ok(subCategoryService.countSubCategories());
    }

    // ✅ DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteSubCategory(@PathVariable Long id) {
        subCategoryService.deleteSubCategory(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Subcategory deleted successfully", null));
    }
}
