import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeByToken, resubscribeByToken } from '@/lib/actions/emailPreferences.actions';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return new NextResponse('Missing unsubscribe token', { status: 400 });
  }

  const result = await unsubscribeByToken(token);

  if (!result.success) {
    return new NextResponse('Invalid unsubscribe token', { status: 400 });
  }

  const redirectUrl = new URL('/unsubscribed', request.url);
  redirectUrl.searchParams.set('token', token);
  return NextResponse.redirect(redirectUrl);
}

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return new NextResponse('Missing unsubscribe token', { status: 400 });
  }

  const result = await resubscribeByToken(token);

  if (!result.success) {
    return new NextResponse('Invalid unsubscribe token', { status: 400 });
  }

  const redirectUrl = new URL('/unsubscribed', request.url);
  redirectUrl.searchParams.set('token', token);
  redirectUrl.searchParams.set('resubscribed', 'true');
  return NextResponse.redirect(redirectUrl);
}