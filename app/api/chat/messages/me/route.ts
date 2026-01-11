import { NextRequest, NextResponse } from "next/server";
// @ts-ignore - iron-session has built-in types
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

const BACKEND_URL = "http://localhost:8090";


// Helper function to get auth headers
function getAuthHeaders(session: SessionData) {
  return {
    'Authorization': `Bearer ${session.token}`,
    'Content-Type': 'application/json',
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!session.isLoggedIn || !session.token) {
      return NextResponse.json({
        success: false,
        message: "Authentication required",
        data: null
      }, { status: 401 });
    }

    const backendUrl = `${BACKEND_URL}/chats/me/messages?page=${page}&size=${limit}`;

    const backendRes = await fetch(backendUrl, {
      method: "GET",
      headers: getAuthHeaders(session),
    });

    if (!backendRes.ok) {
      console.error("Backend error:", backendRes.status);
      return NextResponse.json({
        success: true,
        data: {
          messages: [],
          total: 0,
          page,
          limit,
          hasMore: false
        }
      });
    }

    const data = await backendRes.json();

    // Normalize messages - reverse order so oldest messages come first
    const messages = (data.content || [])
      .filter((msg: any) => msg.message && msg.message.trim())
      .map((msg: any) => ({
        id: msg.id,
        sessionId: msg.sessionId || 'user-chat',
        text: msg.message,
        sender: msg.sender === "ADMIN" ? "admin" : "user",
        timestamp: new Date(msg.sentAt),
      }))
      .reverse(); // Reverse so oldest messages are first

    return NextResponse.json({
      success: true,
      data: {
        messages,
        total: data.totalElements,
        page: data.number,
        limit: data.size,
        hasMore: !data.last
      }
    });

  } catch (error) {
    console.error("Error fetching user messages:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch messages",
        data: null
      },
      { status: 500 }
    );
  }
}