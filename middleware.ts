import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
]);

// Use Clerk's built-in middleware (Edge Runtime compatible)
export default clerkMiddleware((auth, request) => {
  // Public routes are accessible to everyone
  if (isPublicRoute(request)) {
    return;
  }
  
  // For protected routes, Clerk automatically handles authentication
  // If user is not authenticated, they'll be redirected to sign-in
  auth().protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};