import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore - iron-session has built-in types
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '../../../lib/session';

const BACKEND_URL = 'http://localhost:8090/api/v1/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('Login attempt for:', email);

    // Call backend API
    const response = await fetch(`${BACKEND_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('Backend response status:', response.status);

    let data;
    try {
      data = await response.json();
      console.log('Backend response data:', data);
    } catch (parseError) {
      console.error('Failed to parse response JSON:', parseError);
      return NextResponse.json({
        success: false,
        message: 'Invalid response from server'
      }, { status: 500 });
    }

    if (response.ok && data.success && data.data) {
      // Create response first
      const apiResponse = NextResponse.json({
        success: true,
        message: data.message,
        data: data.data
      });

      // Store JWT token and user info in session using the response
      const session = await getIronSession<SessionData>(request, apiResponse, sessionOptions);

      // Set session data
      session.token = data.data.token;
      session.role = data.data.role;
      session.isLoggedIn = true;

      // Save session - this should attach cookie to apiResponse
      await session.save();

      console.log('Login successful, session saved:', {
        hasToken: !!session.token,
        role: session.role,
        isLoggedIn: session.isLoggedIn,
        allKeys: Object.keys(session)
      });

      return apiResponse;
    }

    console.log('Login failed:', data.message);
    return NextResponse.json({
      success: false,
      message: data.message || 'Login failed'
    }, { status: response.status });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}