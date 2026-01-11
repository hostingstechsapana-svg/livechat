import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore - iron-session has built-in types
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '../../../../../lib/session';

const BACKEND_URL = 'http://localhost:8090/api/admin/categories';

// Helper function to get auth headers
function getAuthHeaders(session: SessionData) {
  return {
    'Authorization': `Bearer ${session.token}`,
    'Content-Type': 'application/json',
  };
}

// GET /api/admin/categories/[id] - Get category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    console.error('Get category error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch category'
    }, { status: 500 });
  }
}

// PUT /api/admin/categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.isLoggedIn || !session.token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(session),
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update category'
    }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.isLoggedIn || !session.token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const response = await fetch(`${BACKEND_URL}/delete/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(session),
    });

    if (response.ok) {
      try {
        const data = await response.json();
        return NextResponse.json(data);
      } catch {
        return NextResponse.json({
          success: true,
          message: 'Category deleted successfully'
        });
      }
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to delete category'
    }, { status: response.status });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete category'
    }, { status: 500 });
  }
}