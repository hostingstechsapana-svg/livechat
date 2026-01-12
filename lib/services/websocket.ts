import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessageEvent, TypingEvent } from '../types/chat';

class WebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private subscriptions = new Map<string, any>();
  private connectionPromise: Promise<void> | null = null;
  private wsUrl: string;

  constructor() {
    // Always use localhost for development
    this.wsUrl = `http://localhost:8090/ws`;

    console.log('🔌 WebSocket URL:', this.wsUrl);
  }

  // =========================
  // CONNECT
  // =========================
  async connect(token?: string): Promise<void> {
    if (this.connectionPromise) return this.connectionPromise;

    console.log('🔌 Connecting WebSocket...');

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        console.log('🔌 Creating SockJS with URL:', this.wsUrl);
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

  // =========================
  // INTERNAL HELPERS
  // =========================
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

  // =========================
  // CHAT
  // =========================
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

  // =========================
  // TYPING
  // =========================
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

export const webSocketService = new WebSocketService();