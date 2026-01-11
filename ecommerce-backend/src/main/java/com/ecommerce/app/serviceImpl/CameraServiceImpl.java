package com.ecommerce.app.serviceImpl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ecommerce.app.ENUM.CameraCondition;
import com.ecommerce.app.entities.Camera;
import com.ecommerce.app.entities.CameraCategory;
import com.ecommerce.app.entities.CameraImages;
import com.ecommerce.app.entities.CameraSubCategory;
import com.ecommerce.app.exceptionHandling.BadRequestException;
import com.ecommerce.app.exceptionHandling.ResourceNotFoundException;
import com.ecommerce.app.repository.CameraCategoryRepository;
import com.ecommerce.app.repository.CameraRepository;
import com.ecommerce.app.repository.CameraSubCategoryRepository;
import com.ecommerce.app.requestDto.CameraCreateRequestDTO;
import com.ecommerce.app.requestDto.CameraUpdateRequestDTO;
import com.ecommerce.app.requestDto.CloudinaryImageResult;
import com.ecommerce.app.responseDto.CameraAdminResponseDTO;
import com.ecommerce.app.responseDto.CameraResponseDTO;
import com.ecommerce.app.service.CameraService;
import com.ecommerce.app.service.ImageService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CameraServiceImpl implements CameraService {

    private final CameraRepository cameraRepository;
    private final CameraCategoryRepository categoryRepository;
    private final CameraSubCategoryRepository subCategoryRepository;
    private final ImageService imageService;

    // ================= ADMIN CREATE =================
    @Override
    public CameraAdminResponseDTO createCamera(CameraCreateRequestDTO dto, List<MultipartFile> images) {
    	  
    	if (dto.getCategoryId() == null) {
    	        throw new BadRequestException("Category ID is required");
    	    }

    	    if (dto.getSubCategoryId() == null) {
    	        throw new BadRequestException("SubCategory ID is required");
    	    }
        CameraCategory category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        CameraSubCategory subCategory = subCategoryRepository.findById(dto.getSubCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("SubCategory not found"));

        // calculate discount amount
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (dto.getDiscountPercentage() != null) {
            discountAmount = dto.getPrice()
                    .multiply(BigDecimal.valueOf(dto.getDiscountPercentage()))
                    .divide(BigDecimal.valueOf(100));
        }

        // Initialize images list to avoid NullPointerException
        List<CameraImages> imageEntities = new ArrayList<>();
        if (images != null && !images.isEmpty()) {
            List<CloudinaryImageResult> uploadedImages =
                    imageService.uploadCameraImages(images, category.getName());

            uploadedImages.forEach(img -> imageEntities.add(
                    CameraImages.builder()
                            .imageUrl(img.getImageUrl())
                            .imagePublicId(img.getPublicId())
                            .build()
            ));
        }
        
        String serialNumber = dto.getSerialNumber();
        if (serialNumber != null && serialNumber.trim().isEmpty()) {
            serialNumber = null;
        }
        
        Camera camera = Camera.builder()
                .cameraName(dto.getCameraName())
                .serialNumber(serialNumber)
                .price(dto.getPrice())
                .discountPercentage(dto.getDiscountPercentage())
                .discountAmount(discountAmount)
                .description(dto.getDescription())
                .category(subCategory.getCategory())
                .subCategory(subCategory)
                .cameraCondition(dto.getCameraCondition())
                .shutterCount(dto.getShutterCount())
                .images(imageEntities) // set initialized list here
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build();

        // Set back-reference for images
        camera.getImages().forEach(img -> img.setCamera(camera));

        return mapToAdminResponse(cameraRepository.save(camera));
    }

    // ================= PUBLIC (USER) =================
    @Override
    public List<CameraResponseDTO> getAllCameras() {
        return cameraRepository.findByDeletedFalse()
                .stream()
                .map(this::mapToUserResponse)
                .toList();
    }

    @Override
    public CameraResponseDTO getCameraById(Long cameraId) {
        Camera camera = cameraRepository.findById(cameraId)
                .orElseThrow(() -> new ResourceNotFoundException("Camera not found"));
        return mapToUserResponse(camera);
    }

    // ================= ADMIN UPDATE =================
    @Override
    public CameraAdminResponseDTO updateCamera(Long cameraId, CameraUpdateRequestDTO dto, List<MultipartFile> images) {

        Camera camera = cameraRepository.findById(cameraId)
                .orElseThrow(() -> new ResourceNotFoundException("Camera not found"));

        if (dto.getCameraName() != null) camera.setCameraName(dto.getCameraName());
        if (dto.getSerialNumber() != null) {
            String serialNumber = dto.getSerialNumber().trim();
            camera.setSerialNumber(serialNumber.isEmpty() ? null : serialNumber);
        }
        if (dto.getPrice() != null) camera.setPrice(dto.getPrice());
        if (dto.getDiscountPercentage() != null) camera.setDiscountPercentage(dto.getDiscountPercentage());
        if (dto.getDescription() != null) camera.setDescription(dto.getDescription());
        if (dto.getShutterCount() != null) camera.setShutterCount(dto.getShutterCount());
        if (dto.getCameraCondition() != null) {
            camera.setCameraCondition(dto.getCameraCondition());
        }

        if (dto.getCategoryId() != null) {
            CameraCategory category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            camera.setCategory(category);
        }

        if (dto.getSubCategoryId() != null) {
            CameraSubCategory subCategory = subCategoryRepository.findById(dto.getSubCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("SubCategory not found"));
            camera.setSubCategory(subCategory);
            camera.setCategory(subCategory.getCategory());
        }

        // recalc discount amount
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (camera.getDiscountPercentage() != null) {
            discountAmount = camera.getPrice()
                    .multiply(BigDecimal.valueOf(camera.getDiscountPercentage()))
                    .divide(BigDecimal.valueOf(100));
        }
        camera.setDiscountAmount(discountAmount);

        // handle images
        if (images != null && !images.isEmpty()) {
            if (camera.getImages() != null && !camera.getImages().isEmpty()) {
                List<String> publicIds = camera.getImages()
                        .stream()
                        .map(CameraImages::getImagePublicId)
                        .toList();
                imageService.deleteImages(publicIds);
                camera.getImages().clear();
            } else {
                camera.setImages(new ArrayList<>());
            }

            List<CloudinaryImageResult> uploadedImages =
                    imageService.uploadCameraImages(images, camera.getCategory().getName());

            uploadedImages.forEach(img -> {
                CameraImages cameraImage = CameraImages.builder()
                        .imageUrl(img.getImageUrl())
                        .imagePublicId(img.getPublicId())
                        .camera(camera)
                        .build();
                camera.getImages().add(cameraImage);
            });
        }

        return mapToAdminResponse(camera);
    }

    // ================= DELETE =================
    @Override
    public void deleteCamera(Long cameraId) {
        Camera camera = cameraRepository.findById(cameraId)
                .orElseThrow(() -> new ResourceNotFoundException("Camera not found"));
        camera.setDeleted(true);
    }

    // ================= USER MAPPER =================
    private CameraResponseDTO mapToUserResponse(Camera camera) {
        BigDecimal discountedPrice = camera.getPrice().subtract(camera.getDiscountAmount());
        List<String> images = camera.getImages() != null
                ? camera.getImages().stream().map(CameraImages::getImageUrl).toList()
                : List.of();

        return CameraResponseDTO.builder()
                .id(camera.getId())
                .cameraName(camera.getCameraName())
                .description(camera.getDescription())
                .price(camera.getPrice())
                .discountPercentage(camera.getDiscountPercentage())
                .discountAmount(camera.getDiscountAmount())
                .discountedPrice(discountedPrice)
                .categoryName(camera.getCategory().getName())
                .subCategoryName(camera.getSubCategory().getName())
                .shutterCount(camera.getShutterCount())
                .cameraCondition(camera.getCameraCondition()) 
                .images(images)
                .build();
    }

    // ================= ADMIN MAPPER =================
    private CameraAdminResponseDTO mapToAdminResponse(Camera camera) {
        BigDecimal discountedPrice = camera.getPrice().subtract(camera.getDiscountAmount());
        List<String> images = camera.getImages() != null
                ? camera.getImages().stream().map(CameraImages::getImageUrl).toList()
                : List.of();

        return CameraAdminResponseDTO.builder()
                .id(camera.getId())
                .cameraName(camera.getCameraName())
                .serialNumber(camera.getSerialNumber())
                .description(camera.getDescription())
                .price(camera.getPrice())
                .discountPercentage(camera.getDiscountPercentage())
                .discountAmount(camera.getDiscountAmount())
                .discountedPrice(discountedPrice)
                .categoryName(camera.getCategory().getName())
                .subCategoryName(camera.getSubCategory().getName())
                .shutterCount(camera.getShutterCount())
                .deleted(camera.isDeleted())
                .cameraCondition(camera.getCameraCondition()) 
                .createdAt(camera.getCreatedAt())
                .images(images)
                .build();
    }

    // ================= ADMIN GET =================
    public List<CameraAdminResponseDTO> getAllCamerasForAdmin() {
        return cameraRepository.findAll().stream().map(this::mapToAdminResponse).toList();
    }

    public CameraAdminResponseDTO getCameraByIdForAdmin(Long id) {
        Camera camera = cameraRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Camera not found"));
        return mapToAdminResponse(camera);
    }
    
    @Override
    public List<CameraResponseDTO> getCamerasByCondition(CameraCondition condition) {

        return cameraRepository
                .findByDeletedFalseAndCameraCondition(condition)
                .stream()
                .map(this::mapToUserResponse)
                .toList();
    }
    
    @Override
    public List<CameraAdminResponseDTO> getCamerasByConditionForAdmin(
            CameraCondition condition) {

        return cameraRepository
                .findByCameraCondition(condition)
                .stream()
                .map(this::mapToAdminResponse)
                .toList();
    }


}
