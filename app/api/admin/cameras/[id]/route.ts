import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore - iron-session has built-in types
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '../../../../../lib/session';

const BACKEND_URL = 'http://localhost:8090/api/admin/cameras';

// Helper function to get auth headers
function getAuthHeaders(session: SessionData) {
  return {
    'Authorization': `Bearer ${session.token}`,
  };
}

// GET /api/admin/cameras/[id] - Get camera by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || id === "undefined") {
      return NextResponse.json(
        { success: false, message: "Invalid camera id" },
        { status: 400 }
      );
    }

    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.isLoggedIn || !session.token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

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
    console.error('Get camera error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch camera'
    }, { status: 500 });
  }
}

// PUT /api/admin/cameras/[id] - Update camera
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

    if (!id || id === "undefined") {
      return NextResponse.json(
        { success: false, message: "Invalid camera id" },
        { status: 400 }
      );
    }

    const formData = await request.formData();

    const response = await fetch(`${BACKEND_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(session),
      body: formData,
    });

    if (response.ok) {
      try {
        const data = await response.json();
        return NextResponse.json(data);
      } catch {
        return NextResponse.json({
          success: true,
          message: 'Camera updated successfully'
        });
      }
    }

    try {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } catch {
      return NextResponse.json({
        success: false,
        message: 'Failed to update camera'
      }, { status: response.status });
    }
  } catch (error) {
    console.error('Update camera error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update camera'
    }, { status: 500 });
  }
}