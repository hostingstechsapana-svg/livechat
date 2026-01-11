"use client";

import AdminChatRoom from "./admin-chat-room";
import { useWebSocketChat } from "@/lib/hooks/chat";

export default function AdminChatDashboard() {
  // WebSocket connection is established in AdminChatRoom with proper sessionId
  // Directly show the default session chat, hide all other UI
  return <AdminChatRoom sessionId="default-user-session" userName="Default User" />;
}
