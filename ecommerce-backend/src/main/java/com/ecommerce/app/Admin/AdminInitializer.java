package com.ecommerce.app.Admin;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.ecommerce.app.ENUM.Role;
import com.ecommerce.app.entities.User;
import com.ecommerce.app.repository.UserRepository;

@Configuration
public class AdminInitializer {
	
@Value("${ADMIN_EMAIL}")
private String adminEmail;

@Value("${ADMIN_PASSWORD}")
private String adminPassword;

    @Bean
    CommandLineRunner initAdmin(UserRepository adminRepository, 
    		PasswordEncoder passwordEncoder) {
        return args -> {
            // Fail fast if environment variables are missing
            if (adminEmail == null || adminPassword == null) {
               throw new IllegalStateException(
                    "Environment variables ADMIN_USERNAME and ADMIN_PASSWORD must be set!"
                );
            }
        	String adminUserName = "Admin";
            // Check if admin already exists
            if (adminRepository.findByEmail(adminEmail).isEmpty()) {
                User admin = User.builder()
                        .fullName(adminUserName)
                        .password(passwordEncoder.encode(adminPassword))
                        .role(Role.ADMIN)
                        .email(adminEmail)
                        .createdAt(LocalDateTime.now())
                        .build();

                adminRepository.save(admin);
                System.out.println("Admin user created: " + adminUserName);
            } else {
                System.out.println("Admin user already exists: " + adminUserName);
            }
       };
   }
}



