import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore - iron-session has built-in types
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '../../../../../../lib/session';

const BACKEND_URL = 'http://localhost:8090/api/admin/cameras/delete';

// Helper function to get auth headers
function getAuthHeaders(session: SessionData) {
  return {
    'Authorization': `Bearer ${session.token}`,
  };
}

// DELETE /api/admin/cameras/delete/[id] - Delete camera
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

    const idNum = parseInt(id, 10);
    if (isNaN(idNum) || idNum <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid camera id" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(session),
    });

    // The backend returns a body on success, so we try to parse it.
    if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
    }
    
    // Handle backend errors
    const errorData = await response.json().catch(() => ({})); // Catch cases where response is not JSON
    return NextResponse.json({
      success: false,
      message: errorData.message || 'Failed to delete camera'
    }, { status: response.status });

  } catch (error) {
    console.error('Delete camera error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete camera'
    }, { status: 500 });
  }
}
