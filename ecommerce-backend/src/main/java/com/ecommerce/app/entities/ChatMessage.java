package com.ecommerce.app.entities;

import java.time.LocalDateTime;

import com.ecommerce.app.ENUM.MessageStatus;
import com.ecommerce.app.ENUM.SenderType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sender; // USER / ADMIN

    @Enumerated(EnumType.STRING)
    private SenderType senders;
    
    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    private MessageStatus status;  // SENT, DELIVERED, SEEN

    @ManyToOne(fetch = FetchType.LAZY)
    private ChatRoom chatRoom;

    private LocalDateTime sentAt;
}

