"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChatMessage, ChatMessageEvent } from "../types/chat";
import { safeParseDate } from "../utils";
import { webSocketService } from "../services/legacy-websocket"; // legacy service

interface UseUnifiedChatReturn {
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<boolean>;
  loadMessages: (page?: number, limit?: number) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  sessionId: string | null;
  isAuthenticated: boolean;
  typing: boolean;
  sendTyping: (typing: boolean) => void;
}

const GUEST_SESSION_KEY = "guest-chat-session-id";
const AUTH_USER_SESSION_KEY = "auth-user-chat-session-id";

export function useUnifiedChat(): UseUnifiedChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [typing, setTyping] = useState(false);

  const subscriptionRef = useRef<any>(null);
  const typingSubscriptionRef = useRef<any>(null);

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/session");
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(data.success && data.role !== undefined);
        return { isAuthenticated: data.success, role: data.role };
      }
    } catch (err) {
      console.error("Failed to check auth status:", err);
    }
    setIsAuthenticated(false);
    return { isAuthenticated: false, role: null };
  }, []);

  // Generate guest session ID
  const generateGuestSessionId = useCallback(() => {
    return 'public';
  }, []);

  // Initialize session
  const initializeSession = useCallback(async () => {
    const authStatus = await checkAuthStatus();
    if (authStatus.isAuthenticated) {
      setUserRole(authStatus.role);
      setIsAuthenticated(true);
      // For authenticated users, fetch actual sessionId from backend
      try {
        const res = await fetch('/api/chat/room');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data.sessionId) {
            setSessionId(data.data.sessionId);
            return;
          }
        }
      } catch (error) {
        console.error('Failed to fetch user sessionId:', error);
      }
      // Fallback
      setSessionId('default-user-session');
    } else {
      // For guest
      setUserRole(null);
      setIsAuthenticated(false);
      let guestSession = localStorage.getItem(GUEST_SESSION_KEY);
      if (!guestSession) {
        guestSession = generateGuestSessionId();
        localStorage.setItem(GUEST_SESSION_KEY, guestSession);
      }
      setSessionId(guestSession);
    }
  }, [checkAuthStatus, generateGuestSessionId]);

  // WebSocket connection and subscription
  useEffect(() => {
    if (!sessionId) return;

    const connectWebSocket = async () => {
      try {
        // Get token if authenticated
        let token: string | undefined;
        if (isAuthenticated) {
          const sessionRes = await fetch("/api/session");
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json();
            if (sessionData.success && sessionData.token) {
              token = sessionData.token;
            }
          }
        }
        await webSocketService.connect(token);
        setIsConnected(true);
        setError(null);
      } catch (err) {
        console.error("WebSocket connection failed:", err);
        setError("Failed to connect to chat server");
        return;
      }

      // Subscribe to chat messages
      subscriptionRef.current = webSocketService.subscribeToChat(sessionId, (payload: any) => {
        const timestamp = safeParseDate(payload.sentAt || payload.timestamp);
        const messageText = payload.text || payload.message || payload.content || '';

        if (messageText.trim()) {
          const chatMsg: ChatMessage = {
            id: payload.id,
            sessionId,
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
      typingSubscriptionRef.current = webSocketService.subscribeToTyping(`/topic/typing/${sessionId}`, (event: any) => {
        if (isAuthenticated) {
          // Authenticated user sees admin typing
          if (event.sender === "ADMIN") setTyping(event.typing);
        } else {
          // Guest sees admin typing
          if (event.sender === "ADMIN") setTyping(event.typing);
        }
      });
    };

    connectWebSocket();

    return () => {
      if (subscriptionRef.current) {
        webSocketService.unsubscribe(`/topic/chat/${sessionId}`);
        subscriptionRef.current = null;
      }
      if (typingSubscriptionRef.current) {
        webSocketService.unsubscribe(`/topic/typing/${sessionId}`);
        typingSubscriptionRef.current = null;
      }
    };
  }, [sessionId, isAuthenticated]);

  // Load messages
  const loadMessages = useCallback(async (page = 0, limit = 150) => {
    if (!sessionId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Use different API based on authentication status
      const apiUrl = isAuthenticated
        ? `/api/chat/messages/me?page=${page}&limit=${limit}`
        : `/api/chat/messages/${sessionId}?page=${page}&limit=${limit}`;

      const res = await fetch(apiUrl);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          // For guests, 404 means no messages yet - this is OK
          setMessages([]);
          setHasMore(false);
        } else {
          setError("Failed to load messages");
        }
        return;
      }

      const historicalMessages: ChatMessage[] = data.content.map((event: any) => {
        // Handle different possible field names for message text
        const messageText = event.message || event.text || event.content || '';
        return {
          id: event.id,
          sessionId: event.sessionId || event.chatRoom?.sessionId || sessionId,
          text: messageText,
          sender: event.sender === 'ADMIN' ? 'admin' : 'user',
          timestamp: safeParseDate(event.sentAt),
        };
      });

      setMessages(prev => {
        // Merge without duplicates
        const existingIds = new Set(prev.map(m => m.id));
        const newMessages = historicalMessages.filter(m => !existingIds.has(m.id));
        const allMessages = [...newMessages, ...prev];
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
  }, [sessionId, isAuthenticated]);

  // Load more messages (for pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await loadMessages(currentPage + 1);
  }, [hasMore, isLoading, currentPage, loadMessages]);

  // Send message
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !sessionId) {
      return false;
    }

    const sender: 'USER' | 'ADMIN' = userRole === 'ADMIN' ? 'ADMIN' : 'USER';

    // Send via WebSocket
    if (webSocketService.connected) {
      webSocketService.sendChatMessage(sessionId, text, sender);
      return true;
    } else {
      console.warn('WebSocket not connected, cannot send message');
      return false;
    }
  }, [sessionId, userRole]);

  // Send typing indicator
  const sendTyping = useCallback((typingStatus: boolean) => {
    if (!webSocketService.connected || !sessionId) return;
    const sender: 'USER' | 'ADMIN' = userRole === 'ADMIN' ? 'ADMIN' : 'USER';
    webSocketService.sendTyping(sessionId, sender, typingStatus);
  }, [sessionId, userRole]);

  // Initialize on mount
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Load initial messages when session is ready
  useEffect(() => {
    if (sessionId) {
      loadMessages(0);
    }
  }, [sessionId, loadMessages]);

  return {
    messages,
    sendMessage,
    loadMessages,
    loadMoreMessages,
    isConnected,
    isLoading,
    error,
    hasMore,
    sessionId,
    isAuthenticated,
    typing,
    sendTyping,
  };
}