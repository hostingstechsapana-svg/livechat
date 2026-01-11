package com.ecommerce.app.service;

import java.util.List;

import com.ecommerce.app.requestDto.CameraCategoryRequestDTO;
import com.ecommerce.app.responseDto.CameraCategoryResponseDTO;

public interface CameraCategoryService {

    CameraCategoryResponseDTO createCategory(CameraCategoryRequestDTO dto);

    List<CameraCategoryResponseDTO> getAllCategories();
    CameraCategoryResponseDTO getCategoryById(Long id);

    CameraCategoryResponseDTO updateCategory(Long id, CameraCategoryRequestDTO dto);

    void deleteCategory(Long id);
}
