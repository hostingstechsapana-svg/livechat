import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:8090/api/public';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const response = await fetch(`${BACKEND_URL}/${id}`, {
      method: 'GET',
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      if (response.ok) {
        return NextResponse.json({
          success: false,
          message: 'Invalid response format from backend'
        }, { status: 500 });
      } else {
        // For error responses that are not JSON, return generic error
        return NextResponse.json({
          success: false,
          message: `Backend error: ${response.status} ${response.statusText}`
        }, { status: response.status });
      }
    }

    if (response.ok) {
      return NextResponse.json(data);
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Get public camera error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch camera'
    }, { status: 500 });
  }
}
