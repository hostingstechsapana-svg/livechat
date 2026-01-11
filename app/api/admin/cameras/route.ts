import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore - iron-session has built-in types
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '../../../../lib/session';

const BACKEND_URL = 'http://localhost:8090/api/admin/cameras';

// Helper function to get auth headers
function getAuthHeaders(session: SessionData) {
  return {
    'Authorization': `Bearer ${session.token}`,
  };
}

// GET /api/admin/cameras - Get all cameras
export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.isLoggedIn || !session.token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(BACKEND_URL, {
      method: 'GET',
      headers: getAuthHeaders(session),
    });

    if (response.ok) {
      try {
        const data = await response.json();
        return NextResponse.json(data);
      } catch {
        return NextResponse.json({
          success: true,
          message: 'Camera created successfully'
        });
      }
    }

    try {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } catch {
      return NextResponse.json({
        success: false,
        message: 'Failed to create camera'
      }, { status: response.status });
    }
  } catch (error) {
    console.error('Get cameras error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch cameras'
    }, { status: 500 });
  }
}

// POST /api/admin/cameras - Create camera
export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.isLoggedIn || !session.token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();

    const response = await fetch(BACKEND_URL, {
      method: 'POST',
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
          message: 'Camera created successfully'
        });
      }
    }

    try {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } catch {
      return NextResponse.json({
        success: false,
        message: 'Failed to create camera'
      }, { status: response.status });
    }
  } catch (error) {
    console.error('Create camera error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create camera'
    }, { status: 500 });
  }
}