package com.ecommerce.app.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.ecommerce.app.requestDto.CloudinaryImageResult;

public interface ImageService {

    List<CloudinaryImageResult> uploadCameraImages(
            List<MultipartFile> files,
            String categoryName
    );

    void deleteImages(List<String> publicIds);
}
