import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:8090/api/public/cameras/filter/condition';

// GET /api/public/cameras/filter/condition/[condition] - Get cameras by condition
export async function GET(request: NextRequest, { params }: { params: Promise<{ condition: string }> }) {
  const { condition } = await params;

  if (!condition || (condition.toUpperCase() !== 'NEW' && condition.toUpperCase() !== 'USED')) {
    return NextResponse.json({ success: false, message: 'Invalid condition' }, { status: 400 });
  }

  try {
    const response = await fetch(`${BACKEND_URL}/${condition.toUpperCase()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: `Backend returned ${response.status}`
      }, { status: response.status });
    }

    const text = await response.text();
    if (!text) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Get ${condition} cameras error:`, error);
    return NextResponse.json({
      success: false,
      message: `Failed to fetch ${condition} cameras`
    }, { status: 500 });
  }
}
