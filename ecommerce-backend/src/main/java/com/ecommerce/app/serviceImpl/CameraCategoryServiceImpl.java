package com.ecommerce.app.serviceImpl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ecommerce.app.entities.CameraCategory;
import com.ecommerce.app.exceptionHandling.CategoryInUseException;
import com.ecommerce.app.exceptionHandling.ResourceNotFoundException;
import com.ecommerce.app.repository.CameraCategoryRepository;
import com.ecommerce.app.repository.CameraRepository;
import com.ecommerce.app.requestDto.CameraCategoryRequestDTO;
import com.ecommerce.app.responseDto.CameraCategoryResponseDTO;
import com.ecommerce.app.service.CameraCategoryService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CameraCategoryServiceImpl implements CameraCategoryService {

    private final CameraCategoryRepository categoryRepository;
    private final CameraRepository cameraRepository;	

    @Override
    public CameraCategoryResponseDTO createCategory(CameraCategoryRequestDTO dto) {
        CameraCategory category = CameraCategory.builder()
                .name(dto.getName())
                .createdAt(LocalDateTime.now())
                .build();

        CameraCategory saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Override
    public List<CameraCategoryResponseDTO> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    
    @Override
    public CameraCategoryResponseDTO getCategoryById(Long id) {
        CameraCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        return mapToResponse(category);
    }

    @Override
    public CameraCategoryResponseDTO updateCategory(Long id, CameraCategoryRequestDTO dto) {
        CameraCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        category.setName(dto.getName());
        return mapToResponse(category);
    }

    @Override
    public void deleteCategory(Long id) {
        CameraCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (cameraRepository.existsByCategoryId(id)) {
            throw new CategoryInUseException("Cannot delete category because cameras are assigned to it");
        }

        categoryRepository.delete(category);
    }	

    private CameraCategoryResponseDTO mapToResponse(CameraCategory category) {
        return CameraCategoryResponseDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .build();
    }
}
