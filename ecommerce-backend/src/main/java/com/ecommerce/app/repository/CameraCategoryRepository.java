package com.ecommerce.app.repository;


import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.app.entities.CameraCategory;

@Repository
public interface CameraCategoryRepository extends JpaRepository<CameraCategory, Long> {

    Optional<CameraCategory> findByNameIgnoreCase(String name);
    long countByCreatedAtBetween(
            LocalDateTime start,
            LocalDateTime end
    );
    boolean existsByNameIgnoreCase(String name);
}
