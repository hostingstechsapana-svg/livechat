package com.ecommerce.app.service;

import java.util.List;

import com.ecommerce.app.requestDto.SubCategoryCreateRequestDTO;
import com.ecommerce.app.responseDto.SubCategoryFilterResponseDTO;
import com.ecommerce.app.responseDto.SubCategoryResponseDTO;

public interface CameraSubCategoryService {

    SubCategoryResponseDTO create(SubCategoryCreateRequestDTO dto);

    List<SubCategoryResponseDTO> getByCategory(Long categoryId);

    List<SubCategoryFilterResponseDTO> getSubCategoriesForFilter(Long categoryId);

    List<SubCategoryResponseDTO> getAllSubCategories();

    void deleteSubCategory(Long subCategoryId);
    
    SubCategoryResponseDTO update(Long subCategoryId, SubCategoryCreateRequestDTO dto);
    
    long countSubCategories();
}

