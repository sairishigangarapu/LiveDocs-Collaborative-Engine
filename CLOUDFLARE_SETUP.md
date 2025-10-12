# Cloudflare Pages Deployment Setup Guide

## Prerequisites
- Cloudflare account (free tier works)
- Git repository connected to GitHub

## Option 1: Deploy via Cloudflare Dashboard (Recommended)

### Steps:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Create application** → **Pages**
3. Connect your GitHub repository: `sairishigangarapu/notion-clone`
4. Configure build settings:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Node version**: 20.x

### Environment Variables
Add these in Cloudflare Dashboard under Settings → Environment variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key_here
CLERK_SECRET_KEY=your_secret_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Liveblocks
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=your_key
LIVEBLOCKS_PRIVATE_KEY=your_private_key
```

## Option 2: Deploy via CLI

### 1. Login to Cloudflare
```powershell
npx wrangler login
```

### 2. Create Pages Project
```powershell
npx wrangler pages project create notion-clone
```

### 3. Build and Deploy
```powershell
npm run build
npx wrangler pages deploy .next --project-name=notion-clone
```

## Option 3: Using Vercel (Alternative - Easier for Next.js)

Since your project uses Next.js with advanced features (Liveblocks, Firebase), Vercel might be easier:

### Steps:
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel auto-detects Next.js settings
4. Add environment variables
5. Deploy

## Important Notes

⚠️ **Cloudflare Pages Limitations with Next.js:**
- Some Next.js features may not work (API routes, middleware)
- Firebase Admin SDK may have issues in edge runtime
- Consider Vercel or traditional Node.js hosting for full compatibility

## Recommended: Deploy to Vercel

For this project with Clerk, Firebase, and Liveblocks, **Vercel is recommended** because:
- Full Next.js support
- Easy environment variable management
- Better compatibility with your dependencies
- Free tier with good limits

Would you like to deploy to Vercel instead?
