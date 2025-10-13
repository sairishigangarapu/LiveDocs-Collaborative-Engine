import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/sign-in', '/sign-up'];
  const isPublicRoute = publicRoutes.includes(pathname) || 
                        pathname.startsWith('/api/auth') ||
                        pathname.startsWith('/sign-in') ||
                        pathname.startsWith('/sign-up');
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // For protected routes, check for any Clerk session cookie
  // Clerk sets __session in production, __clerk_db_jwt for dev
  const hasClerkSession = request.cookies.has('__session') || 
                          request.cookies.has('__clerk_db_jwt');
  
  if (!hasClerkSession) {
    // Redirect to home page if no session found
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  // Full authentication is verified server-side via auth()
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};