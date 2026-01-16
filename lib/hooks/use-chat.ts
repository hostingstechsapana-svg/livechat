"use client";

import { useState, useEffect } from "react";
import { useEnhancedChat } from "./use-enhanced-chat";
import { SessionManager } from "../services/session-manager";
import { UserType } from "../types/chat";

interface UseChatReturn {
  messages: any[];
  sendMessage: (text: string) => Promise<boolean>;
  loadMessages: (page?: number, limit?: number) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  sessionKey: string | null;
  userType: UserType | null;
  typing: boolean;
  sendTyping: (typing: boolean) => void;
  markMessageSeen: (messageId: number) => void;
  markMessageDelivered: (messageId: number) => void;
  startNewChat: () => void;
}

/**
 * Main chat hook that automatically handles user type detection and session management
 *
 * Features:
 * - Auto-detects user type (PUBLIC, USER, ADMIN)
 * - Manages session keys automatically
 * - Provides unified interface for all chat operations
 * - Handles authentication state changes
 */
export function useChat(): UseChatReturn {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize user session
  useEffect(() => {
    const initializeSession = async () => {
      const session = await SessionManager.getUserSession();
      if (session) {
        setUserType(session.userType);
        setSessionKey(session.sessionKey);
      }
      setIsInitialized(true);
    };

    initializeSession();
  }, []);

  // Use enhanced chat hook when session is ready
  const chatHook = useEnhancedChat({
    userType: userType!,
    sessionKey: sessionKey!,
    autoConnect: isInitialized && !!userType && !!sessionKey
  });

  // Start new chat (clears session for public users)
  const startNewChat = () => {
    SessionManager.startNewChat();
    // Re-initialize session
    const reinitialize = async () => {
      const session = await SessionManager.getUserSession();
      if (session) {
        setUserType(session.userType);
        setSessionKey(session.sessionKey);
      }
    };
    reinitialize();
  };

  return {
    ...chatHook,
    sessionKey,
    userType,
    startNewChat,
  };
}