import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '../../../../../../lib/session';

const BACKEND_URL = 'http://localhost:8090/api/admin/v1/camera-subcategories';

function getAuthHeaders(session: SessionData) {
  return {
    'Authorization': `Bearer ${session.token}`,
    'Content-Type': 'application/json',
  };
}

// GET subcategories by category
export async function GET(request: NextRequest, { params }: { params: { categoryId: string } }) {
  try {
    const session = await getIronSession<SessionData>(
      request, NextResponse.next(), sessionOptions
    );

    if (!session.isLoggedIn || !session.token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { categoryId } = params;
    console.log('Fetching subcategories for category:', categoryId, 'URL:', `${BACKEND_URL}/category/${categoryId}`);
    const response = await fetch(`${BACKEND_URL}/category/${categoryId}`, {
      method: 'GET',
      headers: getAuthHeaders(session),
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

    if (response.ok) {
      return NextResponse.json({ success: true, data: data });
    } else {
      return NextResponse.json({ success: false, message: data.message || 'Failed to fetch subcategories' }, { status: response.status });
    }
  } catch (error) {
    console.error('Get subcategories by category error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch subcategories' }, { status: 500 });
  }
}