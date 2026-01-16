"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChatMessage, ChatMessageEvent, TypingEvent, MessageStatusEvent, UserType, SenderType } from "../types/chat";
import { safeParseDate } from "../utils";
import { enhancedWebSocketService } from "../services/websocket";

interface UseEnhancedChatOptions {
  userType: UserType;
  sessionKey: string;
  autoConnect?: boolean;
}

interface UseEnhancedChatReturn {
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<boolean>;
  loadMessages: (page?: number, limit?: number) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  sessionKey: string;
  userType: UserType;
  typing: boolean;
  sendTyping: (typing: boolean) => void;
  markMessageSeen: (messageId: number) => void;
  markMessageDelivered: (messageId: number) => void;
}

/**
 * Enhanced chat hook that properly handles different user types:
 * - PUBLIC: Uses sessionId (UUID) stored in localStorage
 * - USER: Uses userId from JWT
 * - ADMIN: Uses userId from JWT with admin privileges
 */
export function useEnhancedChat(options: UseEnhancedChatOptions): UseEnhancedChatReturn {
  const { userType, sessionKey, autoConnect = true } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [typing, setTyping] = useState(false);

  const subscriptionRef = useRef<any>(null);
  const typingSubscriptionRef = useRef<any>(null);
  const statusSubscriptionRef = useRef<any>(null);

  // WebSocket connection and subscriptions
  useEffect(() => {
    if (!autoConnect) return;

    const connectWebSocket = async () => {
      try {
        setError(null);

        // Get token for authenticated users
        let token: string | undefined;
        if (userType !== 'PUBLIC') {
          const sessionRes = await fetch("/api/session");
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json();
            if (sessionData.success && sessionData.token) {
              token = sessionData.token;
            }
          }
        }

        await enhancedWebSocketService.connect(userType, sessionKey, token);
        setIsConnected(true);

        // Subscribe to chat messages
        subscriptionRef.current = enhancedWebSocketService.subscribeToChat((payload: any) => {
          console.log('💬 Received chat message:', payload);
          const timestamp = safeParseDate(payload.sentAt || payload.timestamp);
          const messageText = payload.message || payload.text || payload.content || '';

          if (messageText.trim()) {
            const chatMsg: ChatMessage = {
              id: payload.id,
              sessionId: payload.chatRoom?.sessionId || sessionKey,
              text: messageText,
              sender: payload.sender === "ADMIN" ? "admin" : "user",
              timestamp,
            };

            setMessages(prev => {
              const newMessages = [...prev, chatMsg];
              // Sort by timestamp
              newMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
              return newMessages;
            });
          }
        });

        // Subscribe to typing indicators
        typingSubscriptionRef.current = enhancedWebSocketService.subscribeToTyping((event: TypingEvent) => {
          // Show typing indicator from the other party
          if (userType === 'PUBLIC') {
            // Public user sees admin typing
            if (event.sender === "ADMIN") setTyping(event.typing);
          } else {
            // Authenticated user sees admin typing (if not admin themselves)
            if (event.sender === "ADMIN") setTyping(event.typing);
          }
        });

        // Subscribe to message status updates
        statusSubscriptionRef.current = enhancedWebSocketService.subscribeToMessageStatus((event: MessageStatusEvent) => {
          // Update message status in local state
          setMessages(prev => prev.map(msg =>
            msg.id === event.messageId
              ? { ...msg, [event.status.toLowerCase()]: true }
              : msg
          ));
        });

      } catch (err) {
        console.error("❌ WebSocket connection failed:", err);
        setError("Failed to connect to chat server");
      }
    };

    connectWebSocket();

    return () => {
      if (subscriptionRef.current) {
        enhancedWebSocketService.unsubscribe(subscriptionRef.current);
        subscriptionRef.current = null;
      }
      if (typingSubscriptionRef.current) {
        enhancedWebSocketService.unsubscribe(typingSubscriptionRef.current);
        typingSubscriptionRef.current = null;
      }
      if (statusSubscriptionRef.current) {
        enhancedWebSocketService.unsubscribe(statusSubscriptionRef.current);
        statusSubscriptionRef.current = null;
      }
    };
  }, [userType, sessionKey, autoConnect]);

  // Load messages from REST API
  const loadMessages = useCallback(async (page = 0, limit = 150) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use different API endpoints based on user type
      let apiUrl: string;
      if (userType === 'PUBLIC') {
        apiUrl = `/api/chat/messages/${sessionKey}?page=${page}&limit=${limit}`;
      } else {
        apiUrl = `/api/chat/messages/me?page=${page}&limit=${limit}`;
      }

      const res = await fetch(apiUrl);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          // No messages yet - this is OK
          setMessages([]);
          setHasMore(false);
        } else {
          setError("Failed to load messages");
        }
        return;
      }

      const historicalMessages: ChatMessage[] = data.content.map((event: any) => {
        const messageText = event.message || event.text || event.content || '';
        return {
          id: event.id,
          sessionId: event.chatRoom?.sessionId || event.sessionId || sessionKey,
          text: messageText,
          sender: event.sender === 'ADMIN' ? 'admin' : 'user',
          timestamp: safeParseDate(event.sentAt),
          seen: event.seen,
          delivered: event.delivered,
        };
      });

      setMessages(prev => {
        // Remove temp messages
        const nonTempMessages = prev.filter(m => m.id > 0);
        // Merge without duplicates
        const existingIds = new Set(nonTempMessages.map(m => m.id));
        const newMessages = historicalMessages.filter(m => !existingIds.has(m.id));
        const allMessages = [...newMessages, ...nonTempMessages];
        // Sort by timestamp ascending
        allMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        return allMessages;
      });

      setHasMore(!data.last);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to load messages:", err);
      setError("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [sessionKey, userType]);

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await loadMessages(currentPage + 1);
  }, [hasMore, isLoading, currentPage, loadMessages]);

  // Send message
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return false;

    const sender = userType === 'ADMIN' ? 'ADMIN' : 'USER';

    try {
      enhancedWebSocketService.sendChatMessage(text, sender);
      // Optimistically add message to UI immediately for better UX
      const optimisticMessage: ChatMessage = {
        id: -Date.now(), // Temporary negative ID
        sessionId: sessionKey,
        text,
        sender: sender === 'ADMIN' ? 'admin' : 'user',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, optimisticMessage]);

      // Small delay to allow WebSocket to deliver the real message
      setTimeout(() => loadMessages(0, 50), 200);
      return true;
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
      return false;
    }
  }, [sessionKey, userType, loadMessages]);

  // Send typing indicator
  const sendTyping = useCallback((typingStatus: boolean) => {
    try {
      const sender = userType === 'ADMIN' ? 'ADMIN' : 'USER';
      enhancedWebSocketService.sendTyping(typingStatus, sender);
    } catch (err) {
      console.error('Failed to send typing indicator:', err);
    }
  }, [userType]);

  // Mark message as seen
  const markMessageSeen = useCallback((messageId: number) => {
    try {
      enhancedWebSocketService.markMessageStatus(messageId, 'SEEN');
    } catch (err) {
      console.error('Failed to mark message as seen:', err);
    }
  }, []);

  // Mark message as delivered
  const markMessageDelivered = useCallback((messageId: number) => {
    try {
      enhancedWebSocketService.markMessageStatus(messageId, 'DELIVERED');
    } catch (err) {
      console.error('Failed to mark message as delivered:', err);
    }
  }, []);

  // Load initial messages when session is ready
  useEffect(() => {
    if (sessionKey) {
      loadMessages(0);
    }
  }, [sessionKey, loadMessages]);

  return {
    messages,
    sendMessage,
    loadMessages,
    loadMoreMessages,
    isConnected,
    isLoading,
    error,
    hasMore,
    sessionKey,
    userType,
    typing,
    sendTyping,
    markMessageSeen,
    markMessageDelivered,
  };
}