package com.ecommerce.app.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@camerashop.com}")
    private String from;

    @Async
    public void sendNewMessageNotification(String toEmail) {

        SimpleMailMessage message = new SimpleMailMessage();
       
        message.setFrom(from);
        message.setTo(toEmail);
        message.setSubject("New message from CameraShop Admin");
        message.setText(
            "You have received a new message from CameraShop admin.\n\n" +
            "Please login to reply.\n\n" +
            "— CameraShop Team"
        );

        mailSender.send(message);
    }
}
