import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
// @ts-ignore - iron-session has built-in types
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '../../../../lib/session';

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
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Frontend uses 1-based, backend uses 0-based
    const page = Math.max(parseInt(searchParams.get("page") || "1") - 1, 0);
    const limit = parseInt(searchParams.get("limit") || "20");

    const backendRes = await fetch(
      `${BACKEND_URL}/api/admin/chats?page=${page}&size=${limit}`,
      {
        method: "GET",
        headers: getAuthHeaders(session),
      }
    );

    if (!backendRes.ok) {
      console.error("Backend error:", backendRes.status);
      return NextResponse.json(
        { success: false, data: null },
        { status: 500 }
      );
    }

    const data = await backendRes.json();

    // Adapt backend response → frontend format
    const rooms = (data.content || []).map((room: any) => ({
      id: room.id,
      sessionId: room.sessionId,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: {
        rooms,
        total: data.totalElements,
        page: data.number + 1,
        limit: data.size,
        hasMore: !data.last
      }
    });

  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch chat rooms",
        data: null
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Call backend to create a new chat session
    const backendRes = await fetch(`${BACKEND_URL}/chats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // Backend might expect some data, but for now empty
      })
    });

    if (!backendRes.ok) {
      console.error("Backend error creating chat:", backendRes.status);
      // Fallback to frontend generated sessionId
      const sessionId = uuidv4();
      return NextResponse.json({
        success: true,
        data: {
          sessionId,
          createdAt: new Date().toISOString()
        }
      });
    }

    const data = await backendRes.json();

    return NextResponse.json({
      success: true,
      data: {
        sessionId: data.sessionId || data.id,
        createdAt: data.createdAt || new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Error creating chat room:", error);
    // Fallback
    const sessionId = uuidv4();
    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        createdAt: new Date().toISOString()
      }
    });
  }
}
