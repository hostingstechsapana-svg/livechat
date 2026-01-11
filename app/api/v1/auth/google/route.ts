import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.redirect('http://localhost:8090/api/v1/auth/google');
}