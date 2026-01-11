package com.ecommerce.app.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import com.ecommerce.app.ENUM.CameraCondition;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "camera")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Camera {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String cameraName;

    @Column(nullable = false)
    private BigDecimal price;
    
    @Column(nullable = true)
    private String description;
    
    @Column(name = "serial_number", unique = true, nullable = true)
    private String serialNumber;
    
    private Integer discountPercentage;

    @Column(nullable = false)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private CameraCategory category;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subcategory_id", nullable = false)
    private CameraSubCategory subCategory;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CameraCondition cameraCondition;

    @Column(name = "shutter_count",nullable = true)
    private Long shutterCount;

    @OneToMany(
    	    mappedBy = "camera",
    	    cascade = CascadeType.ALL,
    	    orphanRemoval = true,
    	    fetch = FetchType.LAZY
    	)
    	private List<CameraImages> images = new ArrayList<>();

    private boolean deleted = false; // soft delete

    @CreationTimestamp
    private LocalDateTime createdAt;
}
