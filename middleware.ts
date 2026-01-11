import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore - iron-session has built-in types
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from './lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    console.log(`Middleware check for ${pathname}:`, {
      isLoggedIn: session.isLoggedIn,
      hasToken: !!session.token,
      role: session.role,
      allKeys: Object.keys(session)
    });

    if (!session.isLoggedIn || !session.token) {
      console.log(`Redirecting ${pathname} to home - not logged in or no token`);
      // Redirect to home page
      return NextResponse.redirect(new URL('/', request.url));
    } else {
      console.log(`Allowing access to ${pathname}`);
    }
  }

  // Protect admin routes except login
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    console.log(`Middleware check for ${pathname}:`, {
      isLoggedIn: session.isLoggedIn,
      hasToken: !!session.token,
      role: session.role,
      allKeys: Object.keys(session)
    });

    if (!session.isLoggedIn) {
      console.log(`Redirecting ${pathname} to login - not logged in`);
      // Redirect to login page
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      console.log(`Allowing access to ${pathname}`);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};