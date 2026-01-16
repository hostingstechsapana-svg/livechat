import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessageEvent, TypingEvent, MessageStatusEvent, UserType } from '../types/chat';

// =========================
// LEGACY WEBSOCKET SERVICE (for existing hooks)
// =========================

class WebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private subscriptions = new Map<string, any>();
  private connectionPromise: Promise<void> | null = null;
  private wsUrl: string;

  constructor() {
    this.wsUrl = `http://localhost:8090/ws`;
    console.log('🔌 WebSocket URL:', this.wsUrl);
  }

  async connect(token?: string): Promise<void> {
    if (this.connectionPromise) return this.connectionPromise;

    console.log('🔌 Connecting WebSocket...');

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        const sock = new SockJS(this.wsUrl);
        console.log('🔌 SockJS created successfully');

        const connectHeaders: any = {
          'accept-version': '1.0'
        };

        if (token) {
          connectHeaders['Authorization'] = `Bearer ${token}`;
        }

        console.log('🔌 Connect headers:', connectHeaders);

        this.client = new Client({
          webSocketFactory: () => sock,
          connectHeaders,
          reconnectDelay: 5000,
          heartbeatIncoming: 0,
          heartbeatOutgoing: 0,
          debug: console.log,
        });
      } catch (error) {
        console.error('❌ Error creating SockJS:', error);
        reject(error);
        return;
      }

      this.client.onConnect = () => {
        console.log('✅ WebSocket connected');
        this.isConnected = true;
        resolve();
      };

      this.client.onStompError = (frame) => {
        console.error('❌ STOMP Error:', frame);
        console.error('❌ STOMP Error headers:', frame.headers);
        console.error('❌ STOMP Error body:', frame.body);
        this.isConnected = false;
        reject(frame);
      };

      this.client.onWebSocketClose = () => {
        console.warn('⚠️ WebSocket closed');
        this.isConnected = false;
        this.connectionPromise = null;
      };

      this.client.onWebSocketError = (err) => {
        console.error('❌ WebSocket error:', err);
      };

      this.client.activate();
    });

    return this.connectionPromise;
  }

  disconnect() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions.clear();

    this.client?.deactivate();
    this.client = null;

    this.isConnected = false;
    this.connectionPromise = null;

    console.log('🔌 WebSocket disconnected');
  }

  get connected() {
    return this.isConnected;
  }

  private ensureConnected() {
    if (!this.client || !this.isConnected) {
      throw new Error('WebSocket not connected');
    }
  }

  private subscribe<T>(destination: string, cb: (data: T) => void) {
    this.ensureConnected();

    const sub = this.client!.subscribe(destination, msg => {
      if (!msg.body) return;

      try {
        cb(JSON.parse(msg.body));
      } catch (e) {
        console.error(`❌ Failed to parse message from ${destination}`, msg.body);
      }
    });

    this.subscriptions.set(destination, sub);
    return sub;
  }

  unsubscribe(destination: string) {
    this.subscriptions.get(destination)?.unsubscribe();
    this.subscriptions.delete(destination);
  }

  private send(destination: string, payload: any) {
    this.ensureConnected();

    this.client!.publish({
      destination,
      body: JSON.stringify(payload),
    });
  }

  sendChatMessage(sessionId: string, message: string, sender: 'USER' | 'ADMIN') {
    console.log('🔄 Sending chat message to /app/chat.send:', { sessionId, message, sender });
    this.send('/app/chat.send', {
      sessionId,
      message,
      sender,
    });
  }

  subscribeToChat(sessionId: string, cb: (msg: ChatMessageEvent) => void) {
    const topic = `/topic/chat/${sessionId}`;
    console.log('📡 Subscribing to chat topic:', topic);
    const sub = this.subscribe(topic, (payload: any) => {
      console.log('📨 Received chat message on topic:', topic, payload);
      cb(payload as ChatMessageEvent);
    });
    console.log('✅ Subscription created for topic:', topic);
    return sub;
  }

  sendTyping(sessionId: string, sender: 'USER' | 'ADMIN', typing: boolean) {
    this.send('/app/chat.typing', {
      sessionId,
      sender,
      typing,
    });
  }

  subscribeToTyping(sessionId: string, cb: (event: TypingEvent) => void) {
    return this.subscribe(`/topic/typing/${sessionId}`, cb);
  }
}

/**
 * Enhanced WebSocket Service for Real-time Chat
 *
 * Supports three user types with specific backend endpoints:
 * - PUBLIC: Uses sessionId (UUID) for identification
 * - USER: Uses userId from JWT for identification
 * - ADMIN: Uses userId from JWT with admin privileges
 */
class EnhancedWebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private subscriptions = new Map<string, any>();
  private connectionPromise: Promise<void> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private wsUrl: string;
  private currentUserType: UserType | null = null;
  private currentSessionKey: string | null = null;

  constructor() {
    // Always use localhost for development - can be configured via environment
    this.wsUrl = process.env.NEXT_PUBLIC_WS_URL || `http://localhost:8090/ws`;
    console.log('🔌 WebSocket URL:', this.wsUrl);
  }

  // =========================
  // CONNECTION MANAGEMENT
  // =========================

  /**
   * Connect to WebSocket with user-specific authentication
   * @param userType - Type of user connecting (PUBLIC, USER, ADMIN)
   * @param sessionKey - Session identifier (sessionId for PUBLIC, userId for USER/ADMIN)
   * @param token - JWT token for authenticated users
   */
  async connect(userType: UserType, sessionKey: string, token?: string): Promise<void> {
    if (this.connectionPromise) return this.connectionPromise;

    this.currentUserType = userType;
    this.currentSessionKey = sessionKey;

    console.log(`🔌 Connecting WebSocket for ${userType} user with sessionKey: ${sessionKey}`);

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        const sock = new SockJS(this.wsUrl);
        console.log('🔌 SockJS created successfully');

        const connectHeaders: any = {
          'accept-version': '1.0',
          'user-type': userType,
        };

        // Add JWT token for authenticated users
        if (token && (userType === 'USER' || userType === 'ADMIN')) {
          connectHeaders['Authorization'] = `Bearer ${token}`;
          connectHeaders['user-id'] = sessionKey; // userId from JWT
        } else if (userType === 'PUBLIC') {
          connectHeaders['session-id'] = sessionKey; // sessionId for public users
        }

        console.log('🔌 Connect headers:', connectHeaders);

        this.client = new Client({
          webSocketFactory: () => sock,
          connectHeaders,
          reconnectDelay: this.reconnectDelay,
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,
          debug: (str) => console.log('🔌 STOMP:', str),
        });

        this.setupEventHandlers(resolve, reject);
        this.client.activate();

      } catch (error) {
        console.error('❌ Error creating WebSocket connection:', error);
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  private setupEventHandlers(resolve: () => void, reject: (error: any) => void) {
    if (!this.client) return;

    this.client.onConnect = (frame) => {
      console.log('✅ WebSocket connected successfully');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      resolve();
    };

    this.client.onStompError = (frame) => {
      console.error('❌ STOMP Error:', frame.headers['message'], frame.body);
      this.isConnected = false;
      this.connectionPromise = null;

      // Don't reject on STOMP errors during reconnection attempts
      if (this.reconnectAttempts === 0) {
        reject(frame);
      }
    };

    this.client.onWebSocketClose = () => {
      console.warn('⚠️ WebSocket closed');
      this.isConnected = false;
      this.connectionPromise = null;
      this.attemptReconnection();
    };

    this.client.onWebSocketError = (err) => {
      console.error('❌ WebSocket error:', err);
      this.isConnected = false;
      this.connectionPromise = null;
    };
  }

  private async attemptReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    setTimeout(async () => {
      if (this.currentUserType && this.currentSessionKey) {
        try {
          // Get fresh token for authenticated users
          let token: string | undefined;
          if (this.currentUserType !== 'PUBLIC') {
            const sessionRes = await fetch("/api/session");
            if (sessionRes.ok) {
              const sessionData = await sessionRes.json();
              token = sessionData.token;
            }
          }

          await this.connect(this.currentUserType, this.currentSessionKey, token);
        } catch (error) {
          console.error('❌ Reconnection failed:', error);
          this.attemptReconnection();
        }
      }
    }, delay);
  }

  disconnect() {
    console.log('🔌 Disconnecting WebSocket...');
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions.clear();

    this.client?.deactivate();
    this.client = null;

    this.isConnected = false;
    this.connectionPromise = null;
    this.currentUserType = null;
    this.currentSessionKey = null;
    this.reconnectAttempts = 0;

    console.log('🔌 WebSocket disconnected');
  }

  get connected(): boolean {
    return this.isConnected;
  }

  get userType(): UserType | null {
    return this.currentUserType;
  }

  get sessionKey(): string | null {
    return this.currentSessionKey;
  }

  // =========================
  // INTERNAL HELPERS
  // =========================

  private ensureConnected() {
    if (!this.client || !this.isConnected) {
      throw new Error('WebSocket not connected. Call connect() first.');
    }
  }

  private subscribe<T>(destination: string, cb: (data: T) => void): any {
    this.ensureConnected();

    console.log(`📡 Subscribing to: ${destination}`);
    const sub = this.client!.subscribe(destination, msg => {
      if (!msg.body) {
        console.warn(`⚠️ Empty message received on ${destination}`);
        return;
      }

      try {
        const data = JSON.parse(msg.body);
        cb(data);
      } catch (e) {
        console.error(`❌ Failed to parse message from ${destination}:`, msg.body, e);
      }
    });

    this.subscriptions.set(destination, sub);
    return sub;
  }

  unsubscribe(destination: string) {
    const sub = this.subscriptions.get(destination);
    if (sub) {
      console.log(`📡 Unsubscribing from: ${destination}`);
      sub.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }

  private send(destination: string, payload: any) {
    this.ensureConnected();

    console.log(`📤 Sending to ${destination}:`, payload);
    this.client!.publish({
      destination,
      body: JSON.stringify(payload),
    });
  }

  // =========================
  // CHAT MESSAGES
  // =========================

  /**
   * Send chat message based on user type
   * - PUBLIC: Uses /app/chat.send.public with sessionId
   * - USER/ADMIN: Uses /app/chat.send.user with userId
   */
  sendChatMessage(message: string, sender: 'USER' | 'ADMIN' = 'USER') {
    if (!this.currentUserType || !this.currentSessionKey) {
      throw new Error('No user session established');
    }

    const payload: any = {
      message,
      sender,
    };

    let destination: string;
    if (this.currentUserType === 'PUBLIC') {
      // Public users send via /app/chat.send.public with sessionId
      destination = '/app/chat.send.public';
      payload.sessionId = this.currentSessionKey;
      console.log('📤 Sending public chat message:', { destination, sessionId: this.currentSessionKey, message });
    } else {
      // Authenticated users send via /app/chat.send.user with userId
      destination = '/app/chat.send.user';
      payload.userId = this.currentSessionKey;
      console.log('📤 Sending user chat message:', { destination, userId: this.currentSessionKey, message });
    }

    this.send(destination, payload);
  }

  /**
   * Subscribe to chat messages based on user type
   * - PUBLIC: Receives from /topic/chat/{sessionId}
   * - USER: Receives from /topic/chat/user/{userId}
   * - ADMIN: Receives from /topic/chat/user/{userId} (same as USER)
   */
  subscribeToChat(cb: (msg: ChatMessageEvent) => void): any {
    if (!this.currentUserType || !this.currentSessionKey) {
      throw new Error('No user session established');
    }

    let topic: string;
    if (this.currentUserType === 'PUBLIC') {
      // Public users receive from /topic/chat/{sessionId}
      topic = `/topic/chat/${this.currentSessionKey}`;
      console.log('📡 Subscribing to public chat topic:', topic);
    } else {
      // Authenticated users receive from /topic/chat/user/{userId}
      topic = `/topic/chat/user/${this.currentSessionKey}`;
      console.log('📡 Subscribing to user chat topic:', topic);
    }

    return this.subscribe(topic, (payload: any) => {
      console.log('📨 Received chat message:', payload);
      cb(payload as ChatMessageEvent);
    });
  }

  // =========================
  // TYPING INDICATORS
  // =========================

  /**
   * Send typing indicator
   */
  sendTyping(typing: boolean, sender: 'USER' | 'ADMIN' = 'USER') {
    if (!this.currentUserType || !this.currentSessionKey) {
      throw new Error('No user session established');
    }

    const payload: any = {
      sender,
      typing,
    };

    if (this.currentUserType === 'PUBLIC') {
      payload.sessionId = this.currentSessionKey;
    } else {
      payload.userId = this.currentSessionKey;
    }

    this.send('/app/chat.typing', payload);
  }

  /**
   * Subscribe to typing indicators
   */
  subscribeToTyping(cb: (event: TypingEvent) => void): any {
    if (!this.currentUserType || !this.currentSessionKey) {
      throw new Error('No user session established');
    }

    let topic: string;
    if (this.currentUserType === 'PUBLIC') {
      topic = `/topic/typing/${this.currentSessionKey}`;
    } else {
      topic = `/topic/typing/user/${this.currentSessionKey}`;
    }

    return this.subscribe(topic, cb);
  }

  // =========================
  // MESSAGE STATUS (SEEN/DELIVERED)
  // =========================

  /**
   * Mark message as seen/delivered
   */
  markMessageStatus(messageId: number, status: 'SEEN' | 'DELIVERED') {
    this.send('/app/chat.status', {
      messageId,
      status,
      userId: this.currentUserType !== 'PUBLIC' ? this.currentSessionKey : undefined,
      sessionId: this.currentUserType === 'PUBLIC' ? this.currentSessionKey : undefined,
    });
  }

  /**
   * Subscribe to message status updates
   */
  subscribeToMessageStatus(cb: (event: MessageStatusEvent) => void): any {
    if (!this.currentUserType || !this.currentSessionKey) {
      throw new Error('No user session established');
    }

    let topic: string;
    if (this.currentUserType === 'PUBLIC') {
      topic = `/topic/status/${this.currentSessionKey}`;
    } else {
      topic = `/topic/status/user/${this.currentSessionKey}`;
    }

    return this.subscribe(topic, cb);
  }
}


// Export singleton instance
export const enhancedWebSocketService = new EnhancedWebSocketService();