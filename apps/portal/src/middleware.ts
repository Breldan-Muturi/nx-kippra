import authConfig from '@/auth.config';
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
  templatePrefix,
} from '@/routes';
import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isTemplateRoute = nextUrl.pathname.startsWith(templatePrefix);
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute =
    publicRoutes.some((route) => nextUrl.pathname.startsWith(route)) ||
    nextUrl.pathname === '/';
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // Check for puppeteer access on specific routes
  if (isTemplateRoute) {
    const puppeteerToken = req.headers.get('x-puppeteer-secret');
    if (
      puppeteerToken === process.env.PUPPETEER_SECRET ||
      process.env.NODE_ENV !== 'production'
    ) {
      // Allow Puppetter request
      return NextResponse.next();
    } else {
      // Block unauthorized access by returning a 403 forbidden response
      return new NextResponse('Access Denied', { status: 403 });
    }
  }

  if (isApiAuthRoute) {
    return NextResponse.next();
  }
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return NextResponse.redirect(
      new URL(
        `/account?callbackUrl=${encodedCallbackUrl}`,
        process.env.NEXT_PUBLIC_APP_URL,
      ),
    );
  }

  return NextResponse.next();
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
