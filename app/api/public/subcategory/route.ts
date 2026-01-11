import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:8090/api/public';

// GET /api/public/subcategory - Get all subcategories
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/subcategory`, {
      method: 'GET',
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Get public subcategories error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch subcategories'
    }, { status: 500 });
  }
}