package com.ecommerce.app.entities;

import java.time.LocalDateTime;

import com.ecommerce.app.ENUM.Role;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String fullName;

    @Column(nullable = true)
    private String password;
    
    @Column(nullable = false)
    private String email;
    
    @Enumerated(EnumType.STRING)
    private Role role;
    
    private boolean online;
    private LocalDateTime lastSeen;


    private LocalDateTime createdAt;
}
