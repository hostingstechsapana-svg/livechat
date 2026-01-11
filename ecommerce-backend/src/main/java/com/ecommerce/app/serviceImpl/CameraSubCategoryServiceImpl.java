package com.ecommerce.app.serviceImpl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ecommerce.app.entities.CameraCategory;
import com.ecommerce.app.entities.CameraSubCategory;
import com.ecommerce.app.exceptionHandling.ResourceNotFoundException;
import com.ecommerce.app.repository.CameraCategoryRepository;
import com.ecommerce.app.repository.CameraRepository;
import com.ecommerce.app.repository.CameraSubCategoryRepository;
import com.ecommerce.app.requestDto.SubCategoryCreateRequestDTO;
import com.ecommerce.app.responseDto.SubCategoryFilterResponseDTO;
import com.ecommerce.app.responseDto.SubCategoryResponseDTO;
import com.ecommerce.app.service.CameraSubCategoryService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CameraSubCategoryServiceImpl implements CameraSubCategoryService {

    private final CameraCategoryRepository categoryRepository;
    private final CameraSubCategoryRepository subCategoryRepository;
    private final CameraRepository cameraRepository;

    @Override
    public SubCategoryResponseDTO create(SubCategoryCreateRequestDTO dto) {

        CameraCategory category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        CameraSubCategory subCategory = CameraSubCategory.builder()
                .name(dto.getName())
                .category(category)
                .createdAt(LocalDateTime.now())
                .build();

        subCategoryRepository.save(subCategory);

        return SubCategoryResponseDTO.builder()
                .id(subCategory.getId())
                .name(subCategory.getName())
                .categoryName(category.getName())
                .build();
    }

    @Override
    public List<SubCategoryResponseDTO> getByCategory(Long categoryId) {
        return subCategoryRepository.findByCategoryId(categoryId)
                .stream()
                .map(sc -> SubCategoryResponseDTO.builder()
                        .id(sc.getId())
                        .name(sc.getName())
                        .categoryName(sc.getCategory().getName())
                        .build())
                .toList();
    }
    
    @Override
    public List<SubCategoryFilterResponseDTO> getSubCategoriesForFilter(Long categoryId) {

        return subCategoryRepository.findByCategoryId(categoryId)
                .stream()
                .map(sub -> SubCategoryFilterResponseDTO.builder()
                        .id(sub.getId())
                        .name(sub.getName())
                        .categoryName(sub.getCategory().getName())
                        .cameraCount(
                            cameraRepository.countBySubCategoryId(sub.getId())
                        )
                        .build())
                .toList();
    }

    @Override
    public List<SubCategoryResponseDTO> getAllSubCategories() {
        return subCategoryRepository.findAll()
                .stream()
                .map(sc -> SubCategoryResponseDTO.builder()
                        .id(sc.getId())
                        .name(sc.getName())
                        .categoryName(sc.getCategory().getName())
                        .build())
                .toList();
    }

    @Override
    public long countSubCategories() {
        return subCategoryRepository.count();
    }
    
    @Override
    public void deleteSubCategory(Long subCategoryId) {

        CameraSubCategory subCategory = subCategoryRepository.findById(subCategoryId)
                .orElseThrow(() -> new ResourceNotFoundException("SubCategory not found"));

        //  SAFETY CHECK
        long cameraCount = cameraRepository.countBySubCategoryId(subCategoryId);
        if (cameraCount > 0) {
            throw new IllegalStateException(
                "Cannot delete sub-category. Cameras are still associated with it."
            );
        }

        subCategoryRepository.delete(subCategory);
    }
    
    @Override
    public SubCategoryResponseDTO update(Long subCategoryId, SubCategoryCreateRequestDTO dto) {

        if (subCategoryId == null) {
            throw new IllegalArgumentException("SubCategory id must not be null");
        }

        CameraSubCategory subCategory = subCategoryRepository.findById(subCategoryId)
                .orElseThrow(() -> new ResourceNotFoundException("SubCategory not found"));

        CameraCategory category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        subCategory.setName(dto.getName());
        subCategory.setCategory(category);

        CameraSubCategory updated = subCategoryRepository.save(subCategory);

        return SubCategoryResponseDTO.builder()
                .id(updated.getId())
                .name(updated.getName())
                .categoryName(updated.getCategory().getName())
                .build();
    }

}
