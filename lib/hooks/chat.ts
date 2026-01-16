"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { webSocketService } from "../services/legacy-websocket"; // legacy WS service
import { ChatMessage, ChatMessageEvent } from "../types/chat";
import { safeParseDate } from "../utils";

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
        // Get token if admin (assuming admin is authenticated)
        let token: string | undefined;
        if (isAdmin) {
          const sessionRes = await fetch("/api/session");
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json();
            if (sessionData.success && sessionData.token) {
              token = sessionData.token;
            }
          }
        }
        await webSocketService.connect(token || undefined);
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

      // Safely parse timestamp
      const timestamp = safeParseDate(payload.sentAt || payload.timestamp);

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
          // Remove any optimistic messages that match this real message
          const filtered = prev.filter(m =>
            !(m.id < 0 && m.text === chatMsg.text && m.sender === chatMsg.sender)
          );
          // Check if message with this ID already exists
          const exists = filtered.some(m => m.id === chatMsg.id);
          if (exists) {
            console.log('📋 Message already exists, skipping:', chatMsg.id);
            return filtered;
          }
          const newMessages = [...filtered, chatMsg];
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

  // Load historical messages
   const loadMessages = useCallback(async (page = 0, limit = 150) => {
    console.log('📚 Loading historical messages:', { sessionId: currentSessionId, page, limit, isAdmin });
    try {
      // Use session messages API for both admin and users
      const apiUrl = `/api/chat/messages/${currentSessionId}?page=${page}&limit=${limit}`;
      const res = await fetch(apiUrl);
      const pageData = await res.json();
      console.log('📄 API response:', pageData);
      const historicalMessages = pageData.content.map((event: any) => {
        // Handle different possible field names for message text
        const messageText = event.message || event.text || event.content || '';
        return {
          id: event.id,
          sessionId: event.chatRoom?.sessionId || currentSessionId,
          text: messageText,
          sender: event.sender === 'ADMIN' ? 'admin' : 'user',
          timestamp: safeParseDate(event.sentAt),
        };
      });
      console.log('📝 Historical messages loaded:', historicalMessages.length);
      setMessages(prev => {
        // Merge without duplicates
        const existingIds = new Set(prev.map(m => m.id));
        const newMessages = historicalMessages.filter((m: ChatMessage) => !existingIds.has(m.id));
        console.log('📋 Messages after merge:', newMessages.length, 'new,', prev.length, 'existing');
        let allMessages = [...newMessages, ...prev];
        // Sort by timestamp ascending (oldest first)
        allMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        // Remove optimistic messages that have a matching real message
        allMessages = allMessages.filter(m => {
          if (m.id >= 0) return true;
          const hasMatchingReal = allMessages.some(real => real.id > 0 && real.text === m.text && real.sender === m.sender);
          return !hasMatchingReal;
        });
        return allMessages;
      });
    } catch (err) {
      console.error("❌ Failed to load messages", err);
    }
  }, [currentSessionId, isAdmin]);

  // Send message
  const sendMessage = useCallback(
    async (text: string) => {
      console.log('🚀 sendMessage called:', { text, currentSessionId, isAdmin });
      if (!text.trim() || !currentSessionId) {
        console.log('❌ Message not sent - validation failed');
        return false;
      }

      const sender = isAdmin ? "ADMIN" : "USER";
      console.log('👤 Sender type:', sender);

      // Optimistically add the message to UI immediately
      const optimisticMessage: ChatMessage = {
        id: -Date.now(),
        sessionId: currentSessionId,
        text,
        sender: isAdmin ? "admin" : "user",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, optimisticMessage]);

      // Send via WebSocket
      if (webSocketService.connected) {
        console.log('🌐 WebSocket connected, sending message');
        webSocketService.sendChatMessage(currentSessionId, text, sender);

        // Reload messages after a short delay to ensure the message is loaded if WebSocket fails
        setTimeout(() => loadMessages(0, 50), 1000);
        return true;
      } else {
        console.log('❌ WebSocket not connected, cannot send message');
        // Remove optimistic message if send failed
        setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
        return false;
      }
    },
    [currentSessionId, isAdmin, loadMessages]
  );


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