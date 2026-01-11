import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore - iron-session has built-in types
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '../../../../lib/session';

const BACKEND_URL = 'http://localhost:8090/api/admin/dashboard';

// Helper function to get auth headers
function getAuthHeaders(session: SessionData) {
  return {
    'Authorization': `Bearer ${session.token}`,
    'Content-Type': 'application/json',
  };
}

// GET /api/admin/dashboard - Get dashboard counts
// GET /api/admin/dashboard?type=chart - Get category camera chart data
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const isChartRequest = url.searchParams.get('type') === 'chart';

  if (isChartRequest) {
    return getCategoryCameraChart(request);
  }

  return getDashboardCounts(request);
}

async function getDashboardCounts(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.isLoggedIn || !session.token) {
      console.error('Dashboard API: User not authenticated');
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    console.log('Dashboard API: Making request to backend...');
    const response = await fetch(`${BACKEND_URL}/counts`, {
      method: 'GET',
      headers: getAuthHeaders(session),
    });

    console.log('Dashboard API: Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dashboard API: Backend error:', response.status, errorText);
      return NextResponse.json({
        success: false,
        message: `Backend error: ${response.status}`
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('Dashboard API: Success, data:', data);

    // Fetch subcategory count
    try {
      const subCategoryResponse = await fetch('http://localhost:8090/api/admin/v1/camera-subcategories/count', {
        method: 'GET',
        headers: getAuthHeaders(session),
      });

      if (subCategoryResponse.ok) {
        const subCategoryCount = parseInt(await subCategoryResponse.text());
        data.data.totalSubCategories = subCategoryCount;
      }
    } catch (subCatError) {
      console.error('Failed to fetch subcategory count:', subCatError);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Dashboard API: Network error:', error);
    // Return mock data for development
    const mockData = {
      success: true,
      data: {
        totalCategories: 6,
        totalCameras: 24,
        totalSubCategories: 5,
        activeCameras: 18,
        categoriesCreatedThisMonth: 2,
        camerasUploadedThisMonth: 8,
        activeCamerasThisMonth: 15
      }
    };
    console.log('Dashboard API: Returning mock data due to error');
    return NextResponse.json(mockData);
  }
}

async function getCategoryCameraChart(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.isLoggedIn || !session.token) {
      console.error('Dashboard Chart API: User not authenticated');
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    console.log('Dashboard Chart API: Making request to backend...');
    const response = await fetch(`${BACKEND_URL}/category-camera-chart`, {
      method: 'GET',
      headers: getAuthHeaders(session),
    });

    console.log('Dashboard Chart API: Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dashboard Chart API: Backend error:', response.status, errorText);
      return NextResponse.json({
        success: false,
        message: `Backend error: ${response.status}`
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('Dashboard Chart API: Success, data:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Dashboard Chart API: Network error:', error);
    // Return mock data for development
    const mockChartData = {
      success: true,
      data: [
        { categoryName: "DSLR Cameras", cameraCount: 8 },
        { categoryName: "Mirrorless Cameras", cameraCount: 6 },
        { categoryName: "Action Cameras", cameraCount: 4 },
        { categoryName: "Instant Cameras", cameraCount: 3 },
        { categoryName: "Compact Cameras", cameraCount: 3 }
      ]
    };
    console.log('Dashboard Chart API: Returning mock chart data due to error');
    return NextResponse.json(mockChartData);
  }
}