import { UserType } from '../types/chat';

/**
 * Session Manager for Chat System
 *
 * Handles session key generation and management for different user types:
 * - PUBLIC: Generates and stores UUID in localStorage
 * - USER/ADMIN: Retrieves userId from JWT token
 */

const PUBLIC_SESSION_KEY = 'chat-public-session-id';

export class SessionManager {
  /**
   * Generate a new UUID for public users
   */
  private static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Get session key for public users (generates if not exists)
   */
  static getPublicSessionId(): string {
    if (typeof window === 'undefined') {
      return 'server-session'; // Fallback for SSR
    }

    let sessionId = localStorage.getItem(PUBLIC_SESSION_KEY);
    if (!sessionId) {
      sessionId = this.generateUUID();
      localStorage.setItem(PUBLIC_SESSION_KEY, sessionId);
      console.log('🆔 Generated new public session ID:', sessionId);
    } else {
      console.log('🆔 Using existing public session ID:', sessionId);
    }
    return sessionId;
  }

  /**
   * Clear public session (for new chat)
   */
  static clearPublicSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PUBLIC_SESSION_KEY);
      console.log('🗑️ Cleared public session ID');
    }
  }

  /**
   * Get user ID from JWT token for authenticated users
   */
  static async getAuthenticatedUserId(): Promise<string | null> {
    try {
      const res = await fetch('/api/session');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.userId) {
          return data.userId;
        }
        // Fallback: try to decode JWT token
        if (data.token) {
          const payload = JSON.parse(atob(data.token.split('.')[1]));
          return payload.sub || payload.userId;
        }
      }
    } catch (error) {
      console.error('Failed to get authenticated user ID:', error);
    }
    return null;
  }

  /**
   * Get user type and session key based on authentication status
   */
  static async getUserSession(): Promise<{ userType: UserType; sessionKey: string } | null> {
    // Check if user is authenticated
    const userId = await this.getAuthenticatedUserId();

    if (userId) {
      // Check if user is admin
      try {
        const res = await fetch('/api/session');
        if (res.ok) {
          const data = await res.json();
          const isAdmin = data.role === 'ADMIN';
          return {
            userType: isAdmin ? 'ADMIN' : 'USER',
            sessionKey: userId
          };
        }
      } catch (error) {
        console.error('Failed to check user role:', error);
      }

      // Default to USER if role check fails
      return {
        userType: 'USER',
        sessionKey: userId
      };
    } else {
      // Public user
      return {
        userType: 'PUBLIC',
        sessionKey: this.getPublicSessionId()
      };
    }
  }

  /**
   * Start a new chat session (clears current session for public users)
   */
  static startNewChat(): void {
    this.clearPublicSession();
    // For authenticated users, the session persists
  }
}