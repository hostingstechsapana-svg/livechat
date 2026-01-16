# Enhanced Chat Module for Next.js

A production-ready, modular WebSocket chat system that integrates with Spring Boot backend using STOMP over SockJS.

## Features

- ✅ **Multi-user Type Support**: PUBLIC (guest), USER (authenticated), ADMIN
- ✅ **Automatic Session Management**: UUID generation for guests, JWT handling for authenticated users
- ✅ **Real-time Messaging**: WebSocket connections with automatic reconnection
- ✅ **Typing Indicators**: Real-time typing status
- ✅ **Message Status**: Seen/Delivered tracking
- ✅ **Connection Resilience**: Auto-reconnection with exponential backoff
- ✅ **TypeScript**: Full type safety
- ✅ **React Hooks**: Easy integration with React components
- ✅ **Production Ready**: Error handling, logging, and scalability

## Architecture

### User Types & Endpoints

#### 1. Public (Guest) Users
- **Identification**: `sessionId` (UUID stored in localStorage)
- **Send Messages**: `/app/chat.send.public` with `sessionId`
- **Receive Messages**: `/topic/chat/{sessionId}`
- **Typing**: `/topic/typing/{sessionId}`
- **Status**: `/topic/status/{sessionId}`

#### 2. Authenticated Users
- **Identification**: `userId` from JWT token
- **Send Messages**: `/app/chat.send.user` with `userId`
- **Receive Messages**: `/topic/chat/user/{userId}`
- **Typing**: `/topic/typing/user/{userId}`
- **Status**: `/topic/status/user/{userId}`

#### 3. Admin Users
- **Same as Authenticated Users** but with `ADMIN` role
- **Additional privileges**: Can access admin dashboard and manage multiple chat rooms

## Quick Start

### 1. Import the Main Hook

```typescript
import { useChat } from '@/lib/hooks/use-chat';

function ChatComponent() {
  const {
    messages,
    sendMessage,
    isConnected,
    typing,
    sendTyping,
    startNewChat
  } = useChat();

  // Your chat UI here
}
```

### 2. Basic Usage

```typescript
function ChatInterface() {
  const {
    messages,
    sendMessage,
    isConnected,
    error,
    typing,
    sendTyping
  } = useChat();

  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (input.trim()) {
      const success = await sendMessage(input);
      if (success) {
        setInput('');
        sendTyping(false);
      }
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    sendTyping(e.target.value.trim().length > 0);
  };

  return (
    <div>
      {/* Connection Status */}
      <div className={isConnected ? 'text-green-500' : 'text-red-500'}>
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>

      {/* Error Display */}
      {error && <div className="text-red-500">{error}</div>}

      {/* Messages */}
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className={msg.sender === 'user' ? 'text-right' : 'text-left'}>
            <div className={msg.sender === 'user' ? 'bg-blue-500' : 'bg-gray-200'}>
              {msg.text}
            </div>
            <small>{msg.timestamp.toLocaleTimeString()}</small>
          </div>
        ))}
      </div>

      {/* Typing Indicator */}
      {typing && <div>Admin is typing...</div>}

      {/* Input */}
      <input
        value={input}
        onChange={handleInputChange}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Type your message..."
      />
      <button onClick={handleSend} disabled={!isConnected}>
        Send
      </button>
    </div>
  );
}
```

### 3. Advanced Usage with Message Status

```typescript
function AdvancedChat() {
  const {
    messages,
    sendMessage,
    markMessageSeen,
    markMessageDelivered,
    userType,
    sessionKey
  } = useChat();

  // Mark messages as seen when they come into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = parseInt(entry.target.dataset.messageId);
            markMessageSeen(messageId);
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('[data-message-id]').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [messages, markMessageSeen]);

  return (
    <div>
      {/* User Info */}
      <div className="mb-4">
        <p>User Type: {userType}</p>
        <p>Session: {sessionKey?.slice(-8)}</p>
      </div>

      {/* Messages with Status */}
      {messages.map(msg => (
        <div key={msg.id} data-message-id={msg.id}>
          <div className={msg.sender === 'user' ? 'text-right' : 'text-left'}>
            <div className={msg.sender === 'user' ? 'bg-blue-500' : 'bg-gray-200'}>
              {msg.text}
            </div>
            <div className="flex gap-1 text-xs">
              <span>{msg.timestamp.toLocaleTimeString()}</span>
              {msg.sender === 'user' && (
                <>
                  {msg.delivered && <span>✓</span>}
                  {msg.seen && <span className="text-blue-500">✓✓</span>}
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## API Reference

### useChat Hook

The main hook that automatically handles user type detection and session management.

```typescript
interface UseChatReturn {
  // Messages
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<boolean>;

  // Pagination
  loadMessages: (page?: number, limit?: number) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  hasMore: boolean;

  // Connection
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;

  // User Info
  sessionKey: string | null;
  userType: UserType | null;

  // Typing
  typing: boolean;
  sendTyping: (typing: boolean) => void;

  // Message Status
  markMessageSeen: (messageId: number) => void;
  markMessageDelivered: (messageId: number) => void;

  // Session Management
  startNewChat: () => void;
}
```

### useEnhancedChat Hook

Lower-level hook for manual user type and session key specification.

```typescript
interface UseEnhancedChatOptions {
  userType: UserType;
  sessionKey: string;
  autoConnect?: boolean;
}

const chat = useEnhancedChat({
  userType: 'PUBLIC',
  sessionKey: 'session-uuid',
  autoConnect: true
});
```

### SessionManager

Utility class for managing chat sessions.

```typescript
import { SessionManager } from '@/lib/services/session-manager';

// Get current user session
const session = await SessionManager.getUserSession();
// Returns: { userType: 'PUBLIC' | 'USER' | 'ADMIN', sessionKey: string }

// Start new chat (clears public session)
SessionManager.startNewChat();
```

### EnhancedWebSocketService

Direct WebSocket service access for advanced use cases.

```typescript
import { enhancedWebSocketService } from '@/lib/services/websocket';

// Connect
await enhancedWebSocketService.connect('PUBLIC', 'session-uuid');

// Send message
enhancedWebSocketService.sendChatMessage('Hello!', 'USER');

// Subscribe to messages
const subscription = enhancedWebSocketService.subscribeToChat((msg) => {
  console.log('New message:', msg);
});

// Disconnect
enhancedWebSocketService.disconnect();
```

## Configuration

### Environment Variables

```env
# WebSocket URL (defaults to localhost:8090)
NEXT_PUBLIC_WS_URL=http://localhost:8090/ws
```

### Backend Integration

Ensure your Spring Boot backend exposes these endpoints:

#### WebSocket Configuration
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").withSockJS();
    }
}
```

#### Message Controllers
```java
@Controller
public class ChatController {

    @MessageMapping("/chat.send.public")
    @SendTo("/topic/chat/{sessionId}")
    public ChatMessageEvent sendPublicMessage(
            @Payload ChatMessageRequest request,
            @DestinationVariable String sessionId) {
        // Handle public message
    }

    @MessageMapping("/chat.send.user")
    @SendTo("/topic/chat/user/{userId}")
    public ChatMessageEvent sendUserMessage(
            @Payload ChatMessageRequest request,
            @Header("userId") String userId) {
        // Handle authenticated user message
    }
}
```

## Type Definitions

```typescript
export type UserType = 'PUBLIC' | 'USER' | 'ADMIN';
export type SenderType = 'USER' | 'ADMIN';

export interface ChatMessageEvent {
  id: number;
  sender: SenderType;
  message: string;
  sentAt: string;
  chatRoom?: { id: number; sessionId: string };
  userId?: string;
  seen?: boolean;
  delivered?: boolean;
}

export interface ChatMessage {
  id: number;
  sessionId: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: Date;
  seen?: boolean;
  delivered?: boolean;
}
```

## Error Handling

The module includes comprehensive error handling:

- **Connection Failures**: Automatic reconnection with exponential backoff
- **Message Send Failures**: Returns `false` from `sendMessage()`
- **Authentication Errors**: Graceful fallback to public mode
- **Network Issues**: Connection status indicators and error messages

## Best Practices

1. **Always check connection status** before sending messages
2. **Handle sendMessage return value** to show user feedback
3. **Use typing indicators** for better UX
4. **Mark messages as seen** when they come into view
5. **Handle pagination** for large message histories
6. **Show user type and session info** in debug mode

## Troubleshooting

### Common Issues

1. **WebSocket won't connect**
   - Check backend is running on correct port
   - Verify NEXT_PUBLIC_WS_URL environment variable
   - Check browser console for CORS errors

2. **Messages not sending**
   - Verify user is authenticated for USER/ADMIN types
   - Check JWT token validity
   - Ensure backend endpoints are implemented

3. **Typing indicators not working**
   - Check subscription topics match backend
   - Verify user type detection is correct

### Debug Information

Enable debug logging by checking the browser console. The module logs:
- Connection attempts and status
- Message sending/receiving
- Subscription creation
- Session key generation
- User type detection

## Example Implementation

See `app/enhanced-chat/page.tsx` for a complete working example that demonstrates:
- Automatic user type detection
- Real-time messaging
- Typing indicators
- Message status tracking
- Connection status display
- Error handling
- Debug information

## Migration from Existing Chat

If migrating from the existing chat system:

1. Replace `useWebSocketChat` with `useChat`
2. Update component props (sessionId is now automatic)
3. Add user type handling if needed
4. Update message status handling
5. Test with different user types (guest vs authenticated)

The new module is backward compatible but provides enhanced features and better architecture.</content>
</xai:function_call">...