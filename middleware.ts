import { authMiddleware } from '@clerk/nextjs/server';

export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: ['/', '/api/auth(.*)'],
  // Routes that require authentication
  // By default, all routes not in publicRoutes are protected
  // The /doc routes will require authentication
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};