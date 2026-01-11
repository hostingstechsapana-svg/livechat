package com.ecommerce.app.serviceImpl;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.ecommerce.app.requestDto.CloudinaryImageResult;
import com.ecommerce.app.service.ImageService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CloudinaryImageServiceImpl implements ImageService {

    private final Cloudinary cloudinary;

    @Override
    public List<CloudinaryImageResult> uploadCameraImages(
            List<MultipartFile> files,
            String categoryName) {

        List<CloudinaryImageResult> uploadedUrls = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                Map uploadResult = cloudinary.uploader().upload(
                        file.getBytes(),
                        Map.of(
                            "folder", "cameras/" + categoryName,
                            "resource_type", "image"
                        )
                );

                uploadedUrls.add(
                    CloudinaryImageResult.builder()
                        .imageUrl(uploadResult.get("secure_url").toString())
                        .publicId(uploadResult.get("public_id").toString())
                        .build()
                );

            } catch (IOException e) {
                throw new RuntimeException("Image upload failed");
            }
        }
        return uploadedUrls;
    }

    @Override
    public void deleteImages(List<String> publicIds) {
        for (String publicId : publicIds) {
            try {
                cloudinary.uploader().destroy(publicId, Map.of());
            } catch (IOException e) {
                throw new RuntimeException("Failed to delete image");
            }
        }
    }

}

