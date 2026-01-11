package com.ecommerce.app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.app.entities.CameraSubCategory;

@Repository
public interface CameraSubCategoryRepository extends JpaRepository<CameraSubCategory, Long> {

    // Get all subcategories under a specific category
    List<CameraSubCategory> findByCategoryId(Long categoryId);

    // Optional: check duplicate subcategory under same category
    boolean existsByNameAndCategoryId(String name, Long categoryId);
}
