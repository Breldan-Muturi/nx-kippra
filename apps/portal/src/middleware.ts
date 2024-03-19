import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import {
  DEFAULT_LOGIN_REDIRECT,
  adminRoutes,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
  templatePrefix,
} from "@/routes";
import { currentRole } from "@/lib/auth";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isTemplateRoute = nextUrl.pathname.startsWith(templatePrefix);
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isAdmin = (await currentRole()) === "ADMIN";
  const isAdminRoute = nextUrl.pathname.startsWith(adminRoutes);

  // Check for puppeteer access on specific routes
  if (isTemplateRoute) {
    const puppeteerToken = req.headers.get("x-puppeteer-secret");
    if (puppeteerToken === process.env.PUPPETTER_SECRET) {
      // Allow Puppetter request
      return NextResponse.next();
    } else {
      // Block unauthorized access by returining a 403 forbidden response
      return new NextResponse("Access Denied", { status: 403 });
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
      new URL(`/account?callbackUrl=${encodedCallbackUrl}`, nextUrl),
    );
  }

  if (!isAdmin && isAdminRoute) {
    return NextResponse.rewrite(new URL("/account/error", nextUrl));
  }

  return NextResponse.next();
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
