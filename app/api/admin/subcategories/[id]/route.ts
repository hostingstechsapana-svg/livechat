import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore - iron-session has built-in types
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '../../../../../lib/session';

const BACKEND_URL = 'http://localhost:8090/api/admin/v1/camera-subcategories';

// Helper function to get auth headers
function getAuthHeaders(session: SessionData) {
  return {
    'Authorization': `Bearer ${session.token}`,
    'Content-Type': 'application/json',
  };
}

// GET a single subcategory by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.isLoggedIn || !session.token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const response = await fetch(`${BACKEND_URL}/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(session),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Get subcategory error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch subcategory'
    }, { status: 500 });
  }
}

// PUT (update) a subcategory by ID
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.isLoggedIn || !session.token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(session),
      body: JSON.stringify(body),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = { success: false, message: await response.text() };
    }

    if (response.ok) {
      return NextResponse.json(data);
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Update subcategory error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update subcategory'
    }, { status: 500 });
  }
}

// DELETE a subcategory by ID
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.isLoggedIn || !session.token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const response = await fetch(`${BACKEND_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(session),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Delete subcategory error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete subcategory'
    }, { status: 500 });
  }
}
