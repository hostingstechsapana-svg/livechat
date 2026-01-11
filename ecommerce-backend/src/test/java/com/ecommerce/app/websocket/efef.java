package com.ecommerce.app.websocket;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;

import java.lang.reflect.Type;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.TimeUnit;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ChatWebSocketTest {

    private final BlockingQueue<String> blockingQueue = new LinkedBlockingDeque<>();

    @Test
    void testSendMessage() throws Exception {
        WebSocketStompClient stompClient = new WebSocketStompClient(new StandardWebSocketClient());
        stompClient.setMessageConverter(new MappingJackson2MessageConverter());

        StompSession session = stompClient.connect(
                "ws://localhost:8090/ws",
                new StompSessionHandlerAdapter() {}
        ).get(1, TimeUnit.SECONDS);

        session.subscribe("/topic/chat/123", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return String.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                blockingQueue.add((String) payload);
            }
        });

        // Send a chat message
        session.send("/app/chat.send", "{ \"sessionId\":\"123\", \"message\":\"Hello\", \"sender\":\"User1\" }");

        // Wait for the message to arrive
        String received = blockingQueue.poll(5, TimeUnit.SECONDS);
        assert received != null;
    }
}
