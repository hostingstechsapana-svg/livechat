import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore - iron-session has built-in types
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '../../../../../lib/session';

const BACKEND_URL = 'http://localhost:8090/api/admin/v1/camera-subcategories/count';

// Helper function to get auth headers
function getAuthHeaders(session: SessionData) {
  return {
    'Authorization': `Bearer ${session.token}`,
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.isLoggedIn || !session.token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(BACKEND_URL, {
      method: 'GET',
      headers: getAuthHeaders(session),
    });

    const data = await response.text(); // Since it's a raw Long

    if (response.ok) {
      return NextResponse.json(parseInt(data), { status: 200 });
    }

    return NextResponse.json({ message: 'Failed to count subcategories' }, { status: response.status });
  } catch (error) {
    console.error('Count subcategories error:', error);
    return NextResponse.json({ message: 'Failed to count subcategories' }, { status: 500 });
  }
}
