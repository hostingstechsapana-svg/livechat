package com.ecommerce.app.websocket;

import com.ecommerce.app.entities.ChatRoom;
import com.ecommerce.app.entities.User;
import com.ecommerce.app.responseDto.ChatRoomResponse;

public class ChatRoomMapper {

    public static ChatRoomResponse toResponse(ChatRoom room) {

        User user = room.getUser();

        return new ChatRoomResponse(
            room.getId(),
            room.getSessionId(),
            room.isClosed(),
            room.getCreatedAt(),
            room.getUpdatedAt(),

            user != null ? user.getId() : null,
            user != null ? user.getFullName() : null,
            user != null ? user.getEmail() : null,
            user != null ? user.getRole().name() : null,
            user != null && user.isOnline()
        );
    }
}
