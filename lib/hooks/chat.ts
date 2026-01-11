"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { webSocketService } from "../services/websocket"; // your existing WS service
import { ChatMessage, ChatMessageEvent } from "../types/chat";

export const useWebSocketChat = (sessionId?: string, isAdmin = false) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const subscriptionRef = useRef<any>(null);


  const currentSessionId = sessionId || (typeof window !== 'undefined' ? localStorage.getItem('chatSessionId') || '' : '');

  // Connect
  useEffect(() => {
    if (!isAdmin && !currentSessionId) {
      console.log("No sessionId and not admin, skipping WebSocket connection");
      return;
    }

    let mounted = true;

    const connectWebSocket = async () => {
      try {
        console.log('🔗 Attempting WebSocket connection...');
        // Connect without token for both admin and user to allow anonymous chat
        await webSocketService.connect();
        console.log('✅ WebSocket connection successful');

        if (!mounted) return;
        setConnected(true);
        setConnectionError(null);

      } catch (err) {
        console.error("❌ WebSocket connection failed:", err);
        setConnectionError("Failed to connect to chat server");
      }
    };

    connectWebSocket();

    return () => {
      mounted = false;
    };
  }, [currentSessionId, isAdmin]);

  // Subscribe when sessionId is available
  useEffect(() => {
    if (!connected || !currentSessionId) return;

    subscriptionRef.current = webSocketService.subscribeToChat(currentSessionId, (payload: any) => {
      console.log('💬 Processing received message:', JSON.stringify(payload, null, 2));
      console.log('🔍 Available fields in payload:', Object.keys(payload));

      // Try different timestamp fields
      const timestamp = payload.sentAt ? new Date(payload.sentAt) :
                      payload.timestamp ? new Date(payload.timestamp) : new Date();
      if (isNaN(timestamp.getTime())) {
        console.warn("Invalid timestamp received:", payload.sentAt || payload.timestamp);
      }

      // Handle different possible field names for message text
      const messageText = payload.text || payload.message || payload.content || '';

      const chatMsg: ChatMessage = {
        id: payload.id,
        sessionId: currentSessionId,
        text: messageText,
        sender: payload.sender === "ADMIN" ? "admin" : "user",
        timestamp: timestamp,
      };

      console.log('📝 Adding message to state:', chatMsg);
      if (chatMsg.text && chatMsg.text.trim()) {
        setMessages(prev => {
          const newMessages = [...prev, chatMsg];
          console.log('📋 Updated messages state:', newMessages.length, 'messages');
          return newMessages;
        });
      } else {
        console.log('❌ Skipping message with empty text, available text value:', messageText);
        // For debugging, still add the message if it has an ID (to see backend responses)
        if (payload.id && !messageText) {
          console.log('🔧 Backend sent message with null text - this is the bug to fix in backend');
        }
      }
    });

    return () => {
      if (subscriptionRef.current) {
        webSocketService.unsubscribe(`/topic/chat/${currentSessionId}`);
        subscriptionRef.current = null;
      }
    };
  }, [connected, currentSessionId]);

  // Send message
  const sendMessage = useCallback(
    (text: string) => {
      console.log('🚀 sendMessage called:', { text, currentSessionId, isAdmin });
      if (!text.trim() || (!currentSessionId && !isAdmin)) {
        console.log('❌ Message not sent - validation failed');
        return;
      }

      const sender = isAdmin ? "ADMIN" : "USER";
      console.log('👤 Sender type:', sender);

      // Create message object
      const message: ChatMessage = {
        id: Date.now(), // Temporary ID
        sessionId: currentSessionId,
        text,
        sender: sender === "ADMIN" ? "admin" : "user",
        timestamp: new Date(),
      };

      // Send via WebSocket
      if (webSocketService.connected) {
        console.log('🌐 WebSocket connected, sending message');
        webSocketService.sendChatMessage(currentSessionId, text, sender);
      } else {
        console.log('❌ WebSocket not connected, adding locally');
        // Add to messages immediately for local display
        setMessages(prev => {
          const newMessages = [...prev, message];
          console.log('📋 Local messages after send:', newMessages.length, 'messages');
          return newMessages;
        });
      }
    },
    [currentSessionId, isAdmin]
  );


  // Load historical messages
  const loadMessages = useCallback(async (page = 0, limit = 50) => {
    console.log('📚 Loading historical messages:', { sessionId: currentSessionId, page, limit, isAdmin });
    try {
      // Use session messages API for both admin and users
      const apiUrl = `/api/chat/messages/${currentSessionId}?page=${page}&limit=${limit}`;
      const res = await fetch(apiUrl);
      const pageData = await res.json();
      console.log('📄 API response:', pageData);
      const historicalMessages = pageData.content.map((event: ChatMessageEvent) => ({
        id: event.id,
        sessionId: event.chatRoom?.sessionId || currentSessionId,
        text: event.text,
        sender: event.sender === 'ADMIN' ? 'admin' : 'user',
        timestamp: new Date(event.sentAt),
      }));
      console.log('📝 Historical messages loaded:', historicalMessages.length);
      setMessages(prev => {
        // Merge without duplicates - add older messages to the beginning
        const existingIds = new Set(prev.map(m => m.id));
        const newMessages = historicalMessages.filter((m: ChatMessage) => !existingIds.has(m.id));
        console.log('📋 Messages after merge:', newMessages.length, 'new,', prev.length, 'existing');
        return [...newMessages, ...prev];
      });
    } catch (err) {
      console.error("❌ Failed to load messages", err);
    }
  }, [currentSessionId, isAdmin]);


  return {
    messages,
    sendMessage,
    loadMessages,
    isConnected: connected,
    connectionError,
  };
};

// =========================
// Typing indicator hook
// =========================
export const useTypingIndicator = (sessionId: string, isAdmin = false) => {
  const [typing, setTyping] = useState(false);
  const subRef = useRef<any>(null);

  useEffect(() => {
    if (!webSocketService.connected) return;

    const topic = `/topic/typing/${sessionId}`;
    subRef.current = webSocketService.subscribeToTyping(topic, (event: any) => {
      if (isAdmin) {
        // Admin sees user typing
        if (event.sender === "USER") setTyping(event.typing);
      } else {
        // User sees admin typing
        if (event.sender === "ADMIN") setTyping(event.typing);
      }
    });

    return () => {
      if (subRef.current) webSocketService.unsubscribe(topic);
    };
  }, [sessionId, isAdmin]);

  const sendTyping = (typingStatus: boolean) => {
    if (!webSocketService.connected) return;
    const sender = isAdmin ? "ADMIN" : "USER";
    webSocketService.sendTyping(sessionId, sender, typingStatus);
  };

  return { typing, sendTyping };
};