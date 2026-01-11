import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '../../../../lib/session';

const BACKEND_URL = 'http://localhost:8090/api/admin/v1/camera-subcategories';

function getAuthHeaders(session: SessionData) {
  return {
    'Authorization': `Bearer ${session.token}`,
    'Content-Type': 'application/json',
  };
}

// GET all subcategories
export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(
      request, NextResponse.next(), sessionOptions
    );

    if (!session.isLoggedIn || !session.token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}`, {
      method: 'GET',
      headers: getAuthHeaders(session),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ success: true, data: data });
    } else {
      return NextResponse.json({ success: false, message: data.message || 'Failed to fetch subcategories' }, { status: response.status });
    }
  } catch (error) {
    console.error('Get admin subcategories error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch subcategories' }, { status: 500 });
  }
}

// POST a new subcategory
export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(
      request, NextResponse.next(), sessionOptions
    );

    if (!session.isLoggedIn || !session.token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json(); // { name, categoryId }

    const response = await fetch(`${BACKEND_URL}/create`, {
      method: 'POST',
      headers: getAuthHeaders(session),
      body: JSON.stringify(body), // send JSON
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Create subcategory error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create subcategory' }, { status: 500 });
  }
}
