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

    if (!session.isLoggedIn || !session.token) {
      return NextResponse.json({
        success: false,
        message: "Authentication required",
        data: null
      }, { status: 401 });
    }

    // Get user's chat room info
    const backendUrl = `${BACKEND_URL}/chats/me/room`;

    const backendRes = await fetch(backendUrl, {
      method: "GET",
      headers: getAuthHeaders(session),
    });

    if (!backendRes.ok) {
      console.error("Backend error:", backendRes.status);
      return NextResponse.json({
        success: false,
        message: "Failed to get chat room",
        data: null
      }, { status: backendRes.status });
    }

    const contentType = backendRes.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error("Backend returned non-JSON response:", contentType);
      return NextResponse.json({
        success: false,
        message: "Invalid response from backend",
        data: null
      }, { status: 500 });
    }

    const data = await backendRes.json();

    return NextResponse.json({
      success: true,
      data: {
        sessionId: data.sessionId,
        roomId: data.id
      }
    });

  } catch (error) {
    console.error("Error fetching chat room:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch chat room",
        data: null
      },
      { status: 500 }
    );
  }
}