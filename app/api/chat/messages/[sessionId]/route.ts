import { NextRequest, NextResponse } from "next/server";
// @ts-ignore - iron-session has built-in types
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '../../../../../lib/session';

const BACKEND_URL = "http://localhost:8090";

// Helper function to get auth headers
function getAuthHeaders(session: SessionData) {
  return {
    'Authorization': `Bearer ${session.token}`,
    'Content-Type': 'application/json',
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    const { sessionId } = await params;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "0"); // backend is 0-based
    const limit = parseInt(searchParams.get("limit") || "50");

    const isAdmin = session.isLoggedIn && session.token;

    const backendUrl = isAdmin
      ? `${BACKEND_URL}/api/admin/chats/session/${sessionId}/messages?page=${page}&size=${limit}`
      : `${BACKEND_URL}/chats/session/${sessionId}/messages?page=${page}&size=${limit}`;

    const headers = isAdmin
      ? getAuthHeaders(session)
      : { 'Content-Type': 'application/json' };

    const backendRes = await fetch(backendUrl, {
      method: "GET",
      headers,
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
      .filter((msg: any) => msg.text && msg.text.trim())
      .map((msg: any) => ({
        id: msg.id,
        sessionId: msg.sessionId,
        text: msg.text,
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
    console.error("Error fetching messages:", error);
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