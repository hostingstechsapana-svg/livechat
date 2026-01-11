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

    // First, ensure the user has a chat room by calling the room endpoint
    const roomUrl = `${BACKEND_URL}/chats/me/room`;
    const roomRes = await fetch(roomUrl, {
      method: "GET",
      headers: getAuthHeaders(session),
    });

    if (!roomRes.ok) {
      // If no room, try to create one (assuming backend handles authenticated room creation)
      const createRoomRes = await fetch(`${BACKEND_URL}/chats/me/room`, {
        method: "POST",
        headers: getAuthHeaders(session),
      });

      if (!createRoomRes.ok) {
        console.error("Failed to create chat room:", createRoomRes.status);
        return NextResponse.json({
          content: [],
          totalElements: 0,
          number: page,
          size: limit,
          last: true
        }, { status: 404 });
      }
    }

    const backendUrl = `${BACKEND_URL}/api/chat/messages/me?page=${page}&size=${limit}`;
    const backendRes = await fetch(backendUrl, {
      method: "GET",
      headers: getAuthHeaders(session),
    });

    if (!backendRes.ok) {
      console.error("Backend error:", backendRes.status, await backendRes.text());
      if (backendRes.status === 404) {
        return NextResponse.json({
          content: [],
          totalElements: 0,
          number: page,
          size: limit,
          last: true
        }, { status: 404 });
      }
      return NextResponse.json({
        content: [],
        totalElements: 0,
        number: page,
        size: limit,
        last: true
      });
    }

    const contentType = backendRes.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error("Invalid content-type:", contentType, "Response:", await backendRes.text());
      return NextResponse.json({
        content: [],
        totalElements: 0,
        number: page,
        size: limit,
        last: true
      });
    }

    const data = await backendRes.json();

    return NextResponse.json(data);

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