import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/sign-in', '/sign-up'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/api/auth'));
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Protected routes - check for Clerk session cookies
  // Clerk uses multiple cookie strategies depending on the domain setup
  const clerkSession = request.cookies.get('__session')?.value || 
                       request.cookies.get('__clerk_db_jwt')?.value ||
                       // Development mode cookie
                       Array.from(request.cookies.getAll()).some(
                         cookie => cookie.name.startsWith('__client_uat')
                       );
  
  if (!clerkSession) {
    // Redirect to home page if no Clerk session cookie found
    const url = new URL('/', request.url);
    url.searchParams.set('redirect', pathname); // Preserve intended destination
    return NextResponse.redirect(url);
  }
  
  // Note: Full JWT validation happens server-side in:
  // - Server Actions (via await auth())
  // - API Routes (via await auth())
  // - Page Layouts (via await auth())
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};