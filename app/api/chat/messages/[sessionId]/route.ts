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
      if (backendRes.status === 404) {
        return NextResponse.json({
          content: [],
          totalElements: 0,
          number: page,
          size: limit,
          last: true
        }, { status: 200 });
      }
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
