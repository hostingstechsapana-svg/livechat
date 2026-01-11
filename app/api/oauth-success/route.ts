import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const role = searchParams.get('role');

  if (!token || !role) {
    return NextResponse.json({ error: 'Missing token or role' }, { status: 400 });
  }

  const session = await getSession();
  session.token = token;
  session.role = role;
  session.isLoggedIn = true;
  await session.save();

  return NextResponse.redirect(new URL('/dashboard', request.url));
}