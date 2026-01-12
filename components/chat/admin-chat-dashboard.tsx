"use client";

import { useState, useEffect } from "react";
import AdminChatRoom from "./admin-chat-room";
import { ChatRoom, ChatMessage } from "@/lib/types/chat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Clock } from "lucide-react";
import { safeParseDate, formatMessageTime } from "@/lib/utils";

interface RoomWithLatestMessage extends ChatRoom {
  latestMessage?: ChatMessage;
}

export default function AdminChatDashboard() {
  const [rooms, setRooms] = useState<RoomWithLatestMessage[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("default-user-session");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch chat rooms and their latest messages
  useEffect(() => {
    const fetchRoomsWithLatestMessages = async () => {
      try {
        setError(null);
        const res = await fetch('/api/chat/rooms?page=1&limit=100');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const roomsData = data.data.rooms;

            // Fetch latest message for each room
            const roomsWithMessages = await Promise.all(
              roomsData
                .filter((room: ChatRoom) => room.sessionId) // Filter out rooms with null sessionId
                .map(async (room: ChatRoom) => {
                  try {
                    const msgRes = await fetch(`/api/chat/messages/${room.sessionId}?page=0&limit=1`);
                    if (msgRes.ok) {
                      const msgData = await msgRes.json();
                      const latestMessage = msgData.content?.[0];
                      if (latestMessage) {
                        return {
                          ...room,
                          latestMessage: {
                            id: latestMessage.id,
                            sessionId: latestMessage.chatRoom?.sessionId || room.sessionId,
                            text: latestMessage.text,
                            sender: latestMessage.sender === 'ADMIN' ? 'admin' : 'user',
                            timestamp: safeParseDate(latestMessage.sentAt),
                          } as ChatMessage,
                        };
                      }
                    }
                  } catch (msgError) {
                    console.error(`Failed to fetch latest message for ${room.sessionId}:`, msgError);
                  }
                  return room;
                })
            );

            // Sort rooms by latest message timestamp or updatedAt descending (most recent first)
            const sortedRooms = roomsWithMessages.sort((a: RoomWithLatestMessage, b: RoomWithLatestMessage) => {
              const aDate = a.latestMessage?.timestamp || safeParseDate(a.updatedAt || a.createdAt);
              const bDate = b.latestMessage?.timestamp || safeParseDate(b.updatedAt || b.createdAt);
              return bDate.getTime() - aDate.getTime();
            });

            setRooms(sortedRooms);
          } else {
            setError(data.message || "Failed to fetch chat rooms");
          }
        } else {
          setError(`Failed to fetch chat rooms: ${res.status}`);
        }
      } catch (error) {
        console.error("Failed to fetch chat rooms:", error);
        setError("Network error while fetching chat rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomsWithLatestMessages();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
          <p className="text-red-600 mb-2">Failed to load conversations</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Backend API may not be available. Check backend server status.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Sidebar with conversation list */}
      <div className="w-80 border-r bg-gray-50 overflow-y-auto">
        <div className="p-4 border-b bg-white">
          <h2 className="font-semibold text-lg">Conversations</h2>
        </div>
        <div className="p-2">
          {rooms.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
            </div>
          ) : (
            rooms.map((room) => (
              <Card
                key={room.id}
                className={`mb-2 cursor-pointer transition-colors ${
                  selectedSessionId === room.sessionId
                    ? "border-red-500 bg-red-50"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => setSelectedSessionId(room.sessionId)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gray-200 text-gray-600">
                        <MessageCircle className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          Session {room.sessionId.slice(-8)}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatMessageTime(room.latestMessage?.timestamp || safeParseDate(room.updatedAt || room.createdAt))}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {room.latestMessage ? room.latestMessage.text : "No messages yet"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Chat Room */}
      <div className="flex-1">
        <AdminChatRoom sessionId={selectedSessionId} userName={`Session ${selectedSessionId.slice(-8)}`} />
      </div>
    </div>
  );
}
