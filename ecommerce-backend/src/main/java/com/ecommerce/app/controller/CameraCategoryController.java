package com.ecommerce.app.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.app.payload.ApiResponse;
import com.ecommerce.app.requestDto.CameraCategoryRequestDTO;
import com.ecommerce.app.responseDto.CameraCategoryResponseDTO;
import com.ecommerce.app.service.CameraCategoryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")

public class CameraCategoryController {

    private final CameraCategoryService categoryService;

    @PostMapping
    public ResponseEntity<ApiResponse<CameraCategoryResponseDTO>> createCategory(
            @Valid @RequestBody CameraCategoryRequestDTO dto) {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Category created successfully", categoryService.createCategory(dto))
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CameraCategoryResponseDTO>>> getAllCategories() {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Category list fetched", categoryService.getAllCategories())
        );
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CameraCategoryResponseDTO>> getCategoryById(@PathVariable Long id) {
        CameraCategoryResponseDTO category = categoryService.getCategoryById(id); // implement this in service
        return ResponseEntity.ok(new ApiResponse<>(true, "Category fetched", category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CameraCategoryResponseDTO>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CameraCategoryRequestDTO dto) {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Category updated successfully", categoryService.updateCategory(id, dto))
        );
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Category deleted", null));
    }
}
