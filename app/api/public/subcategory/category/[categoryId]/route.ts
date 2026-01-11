import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:8090/api/public';

// GET subcategories by category
export async function GET(request: NextRequest, { params }: { params: Promise<{ categoryId: string }> }) {
  try {
    const { categoryId } = await params;
    console.log('Fetching subcategories for category:', categoryId, 'URL:', `${BACKEND_URL}/category/${categoryId}`);
    const response = await fetch(`${BACKEND_URL}/category/${categoryId}`, {
      method: 'GET',
    });

    console.log('Response status:', response.status);
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      return NextResponse.json({
        success: false,
        message: 'Invalid response format from backend'
      }, { status: 500 });
    }
    console.log('Response data:', data);

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('Get subcategories by category error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch subcategories'
    }, { status: 500 });
  }
}