import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore - iron-session has built-in types
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '../../../lib/session';

const BACKEND_URL = 'http://localhost:8090/api/v1/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    // Call backend logout if we have a token
    if (session.token) {
      try {
        await fetch(`${BACKEND_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Backend logout error:', error);
        // Continue with local session destruction even if backend call fails
      }
    }

    // Destroy local session
    session.destroy();

    return NextResponse.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}