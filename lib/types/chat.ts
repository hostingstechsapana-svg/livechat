// ===== BACKEND-DRIVEN TYPES =====

export type SenderType = 'USER' | 'ADMIN';
export type UserType = 'PUBLIC' | 'USER' | 'ADMIN';

// Matches ChatMessage entity sent over websocket
export interface ChatMessageEvent {
  id: number;
  sender: SenderType;
  message: string;
  sentAt: string;
  chatRoom?: {
    id: number;
    sessionId: string;
  };
  userId?: string; // For authenticated users
  seen?: boolean;
  delivered?: boolean;
}

// Typing DTO (exact match)
export interface TypingEvent {
  sessionId?: string; // For public users
  userId?: string; // For authenticated users
  sender: SenderType;
  typing: boolean;
}

// Message status events
export interface MessageStatusEvent {
  messageId: number;
  status: 'SEEN' | 'DELIVERED';
  timestamp: string;
}

// ===== FRONTEND UI MODELS =====

// Normalized message used by UI
export interface ChatMessage {
  id: number;
  sessionId: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: Date;
}

// Chat room (REST response)
export interface ChatRoom {
  id: number;
  sessionId: string;
  createdAt: string;
  updatedAt?: string;
  unreadCount?: number;
}

// ===== PAGINATION =====

export interface PaginatedMessages {
  content: ChatMessageEvent[];
  totalElements: number;
  number: number;
  size: number;
  last: boolean;
}

export interface ChatApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
