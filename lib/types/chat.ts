// ===== BACKEND-DRIVEN TYPES =====

export type SenderType = 'USER' | 'ADMIN';

// Matches ChatMessage entity sent over websocket
export interface ChatMessageEvent {
  id: number;
  sender: SenderType;
  text: string;
  sentAt: string;
  chatRoom: {
    id: number;
    sessionId: string;
  };
}

// Typing DTO (exact match)
export interface TypingEvent {
  sessionId: string;
  sender: SenderType;
  typing: boolean;
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
