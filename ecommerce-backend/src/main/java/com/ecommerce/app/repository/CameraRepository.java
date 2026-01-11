package com.ecommerce.app.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.ecommerce.app.ENUM.CameraCondition;
import com.ecommerce.app.entities.Camera;
import com.ecommerce.app.entities.CameraCategory;
import com.ecommerce.app.responseDto.CategoryCameraCountProjection;

@Repository
public interface CameraRepository extends JpaRepository<Camera, Long> {

    // For Admin panel – ignore soft deleted cameras
    List<Camera> findByDeletedFalse();
    
    long countByDeletedFalse();

    long countByCreatedAtBetween(
            LocalDateTime start,
            LocalDateTime end
    );

    long countByDeletedFalseAndCreatedAtBetween(
            LocalDateTime start,
            LocalDateTime end
    ); 
    
    // active cameras only
    // Fetch camera with images + category (avoids LazyInitializationException)
    @EntityGraph(attributePaths = {"images", "category"})
    Optional<Camera> findByIdAndDeletedFalse(Long id);

    // Used for pagination later (admin/user listing)
    Page<Camera> findByDeletedFalse(Pageable pageable);
    boolean existsByCategoryId(Long categoryId);
    // Check duplicate camera name inside same category
    boolean existsByCameraNameIgnoreCaseAndCategoryAndDeletedFalse(
            String cameraName,
            CameraCategory  category
    );
    
    @Query("""
            SELECT 
                c.category.name AS categoryName,
                COUNT(c.id) AS cameraCount
            FROM Camera c
            WHERE c.deleted = false
            GROUP BY c.category.name
        """)
        List<CategoryCameraCountProjection> countCamerasByCategory();
    
    long countBySubCategoryId(Long subCategoryId);

    List<Camera> findByDeletedFalseAndCameraCondition(CameraCondition condition);
    
    List<Camera> findByCameraCondition(CameraCondition condition);

}

